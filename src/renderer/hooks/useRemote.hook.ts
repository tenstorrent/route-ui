import { spawn } from 'child_process';
import dns from 'dns';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

import useAppConfig from './useAppConfig.hook';
import useLogging from './useLogging.hook';

// Required for connecting to a socket on localhost
dns.setDefaultResultOrder('ipv4first');

export interface RemoteConnection {
    name: string;
    host: string;
    port: number;
    path: string;
}

export enum ConnectionTestStates {
    IDLE,
    PROGRESS,
    FAILED,
    OK,
}

export interface ConnectionStatus {
    status: ConnectionTestStates;
    message: string;
}

export interface RemoteFolder {
    /** Name of the test results folder */
    testName: string;
    /** Remote absolute path to the test results folder */
    remotePath: string;
    /** Local absolute path to the test results folder */
    localPath: string;
    /** Last time the folder was modified on remote */
    lastModified: string;
    /** Last time the folder was synced */
    lastSynced?: string;
}

const escapeWhitespace = (str: string) => str.replace(/(\s)/g, '\\$1');

const useRemoteConnection = () => {
    const logging = useLogging();
    const { getAppConfig, setAppConfig, deleteAppConfig } = useAppConfig();
    const defaultSshOptions = ['-q', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=240'];

    const runShellCommand = async (cmd: string, params: string[]) => {
        return new Promise<string>((resolve, reject) => {
            logging.info(`Running command: ${cmd} ${params.join(' ')}`);

            const command = spawn(cmd, params, {
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true,
                windowsHide: true,
            });

            let stdout = '';
            command.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            let stderr = '';
            command.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            command.on('close', (code) => {
                logging.info(`Command exited with code ${code}`);

                if (code !== 0 || stderr.length > 0) {
                    reject(Error(`Command failed: ${cmd} ${params.join(' ')}\n${stderr}`));
                }
                resolve(stdout);
            });

            command.on('error', (err) => reject(err));
            command.on('disconnect', () => reject(Error('Command disconnected')));
        });
    };

    const testConnection = async (connection: RemoteConnection) => {
        const connectionStatus: ConnectionStatus = {
            status: ConnectionTestStates.IDLE,
            message: '',
        };

        connectionStatus.status = ConnectionTestStates.PROGRESS;

        try {
            const sshParams = [...defaultSshOptions, connection.host, '-p', connection.port.toString(), 'exit'];

            await runShellCommand('ssh', sshParams);

            connectionStatus.status = ConnectionTestStates.OK;
            connectionStatus.message = 'Connection successful';

            return connectionStatus;
        } catch (err: any) {
            connectionStatus.status = ConnectionTestStates.FAILED;
            connectionStatus.message = `Connection failed: ${err?.message.toString() ?? err?.toString()}`;

            return connectionStatus;
        }
    };

    const testRemoteFolder = async (connection: RemoteConnection) => {
        const connectionStatus: ConnectionStatus = {
            status: ConnectionTestStates.IDLE,
            message: '',
        };

        connectionStatus.status = ConnectionTestStates.PROGRESS;

        try {
            const sshParams = [
                ...defaultSshOptions,
                connection.host,
                '-p',
                connection.port.toString(),
                `'test -d ${connection.path}'`,
            ];

            await runShellCommand('ssh', sshParams);

            connectionStatus.status = ConnectionTestStates.OK;
            connectionStatus.message = 'Remote folder path exists';

            return connectionStatus;
        } catch (err: any) {
            connectionStatus.status = ConnectionTestStates.FAILED;
            connectionStatus.message = `Remote folder path failed: ${err?.message.toString() ?? err?.toString()}`;

            return connectionStatus;
        }
    };

    const listRemoteFolders = async (connection?: RemoteConnection) => {
        if (!connection || !connection.host || !connection.port) {
            throw new Error('No connection provided');
        }

        const remote = await import('@electron/remote');

        const parseResults = (results: string) =>
            results
                .split('\n')
                .filter((s) => s.length > 0)
                .map<RemoteFolder>((folderInfo) => {
                    const [_createdDate, lastModified, remoteFolderPath] = folderInfo.split(';');
                    const configDir = remote.app.getPath('userData');
                    const folderName = path.basename(remoteFolderPath);
                    const localFolderForRemote = `${connection.name}-${connection.host}${connection.port}`;

                    return {
                        testName: folderName,
                        remotePath: remoteFolderPath,
                        localPath: path.join(configDir, 'remote-tests', localFolderForRemote, folderName),
                        lastModified: new Date(lastModified).toISOString(),
                    };
                });

        /**
         * This command will be executed on the ssh server, and run the foolowing steps:
         * 1. Find all files named `runtime_data.yaml` or `device_desc.yaml` in the remote path
         * 2. Get the directory that contains the files.
         * 3. Remove duplicates
         * 4. For each directory, separated by a `;`, print:
         *   - The creation date (as an ISO timestamp)
         *   - The last modified date (as an ISO timestamp)
         *   - The directory absolute path on the server
         *
         * The output will look like this:
         * ```csv
         * 2000-01-01T00:00:00.000Z;2000-01-01T00:00:00.000Z;/path/to/remote/folder
         * 2000-01-01T00:00:00.000Z;2000-01-01T00:00:00.000Z;/path/to/remote/folder2
         * ```
         */
        const shellCommand = [
            `find -L "${connection.path}" -mindepth 1 -maxdepth 3 -type f \\( -name "runtime_data.yaml" -o -name "device_desc.yaml" \\) -print0`,
            'xargs -0 -I{} dirname {}',
            'uniq',
            `xargs -I{} sh -c "echo \\"\\$(date -d \\"\\$(stat -c %w \\"{}\\")\\" --iso-8601=seconds);\\$(date -d \\"\\$(stat -c %y \\"{}\\")\\" --iso-8601=seconds);$(echo \\"{}\\")\\""`,
        ].join(' | ');
        const sshParams = [
            ...defaultSshOptions,
            connection.host,
            '-p',
            connection.port.toString(),
            `'${shellCommand}'`,
        ];

        const stdout = await runShellCommand('ssh', sshParams);

        return stdout ? parseResults(stdout) : ([] as RemoteFolder[]);
    };

    const syncRemoteFolder = async (connection?: RemoteConnection, remoteFolder?: RemoteFolder) => {
        if (!connection || !connection.host || !connection.port || !connection.path) {
            throw new Error('No connection provided');
        }

        if (!remoteFolder) {
            throw new Error('No remote folder provided');
        }

        if (!existsSync(remoteFolder.localPath)) {
            await mkdir(remoteFolder.localPath, { recursive: true });
        }

        const sourcePath = `${connection.host}:${escapeWhitespace(remoteFolder.remotePath)}`;
        const baseOptions = ['-az', '-e', `'ssh -p ${connection.port.toString()}'`];
        const pathOptions = [
            '--delete',
            `'${sourcePath}'`,
            escapeWhitespace(remoteFolder.localPath.replace(remoteFolder.testName, '')),
        ];

        try {
            /**
             * First try running with the `-s` option.
             * This option handles the case where the file path has spaces in it.
             * This option is not supported on Mac, so if it fails, we will try again without it.
             *
             * See: https://linux.die.net/man/1/rsync#:~:text=receiving%20host%27s%20charset.-,%2Ds%2C%20%2D%2Dprotect%2Dargs,-This%20option%20sends
             */
            // TODO: review the need for the `-s` option
            await runShellCommand('rsync', ['-s', ...baseOptions, ...pathOptions]);
        } catch (err: any) {
            logging.info(
                `Initial RSYNC attempt failed: ${(err as Error)?.message ?? err?.toString() ?? 'Unknown error'}`,
            );

            /**
             * If the `-s` option fails, try running without it.
             * On Mac, this will work as expected.
             */
            await runShellCommand('rsync', [...baseOptions, ...pathOptions]);
        }
    };

    const persistentState = {
        get savedConnectionList() {
            return JSON.parse(getAppConfig('remoteConnections') ?? '[]') as RemoteConnection[];
        },
        set savedConnectionList(connections: RemoteConnection[]) {
            setAppConfig('remoteConnections', JSON.stringify(connections));
        },
        get selectedConnection() {
            const savedSelectedConnection = JSON.parse(getAppConfig('selectedConnection') ?? 'null');

            return (savedSelectedConnection ?? this.savedConnectionList[0]) as RemoteConnection | undefined;
        },
        set selectedConnection(connection: RemoteConnection | undefined) {
            setAppConfig('selectedConnection', JSON.stringify(connection ?? null));
        },
        getSavedRemoteFolders: (connection?: RemoteConnection) => {
            return JSON.parse(getAppConfig(`${connection?.name}-remoteFolders`) ?? '[]') as RemoteFolder[];
        },
        setSavedRemoteFolders: (connection: RemoteConnection | undefined, folders: RemoteFolder[]) => {
            setAppConfig(`${connection?.name}-remoteFolders`, JSON.stringify(folders));
        },
        deleteSavedRemoteFolders: (connection?: RemoteConnection) => {
            deleteAppConfig(`${connection?.name}-remoteFolders`);
        },
    };

    return {
        testConnection,
        testRemoteFolder,
        syncRemoteFolder,
        listRemoteFolders,
        persistentState,
    };
};

export default useRemoteConnection;
