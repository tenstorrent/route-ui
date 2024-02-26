import { spawn } from 'child_process';
import path from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import dns from 'dns';

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
    path: string;
    /** Last time the folder was fetched from remote */
    lastFetched: string;
    /** Last time the folder was synced */
    lastSynced?: string;
}

const escapeWhitespace = (str: string) => str.replace(/(\s)/g, '\\$1');

const useRemoteConnection = () => {
    const logging = useLogging();
    const defaultSshOptions = ['-q', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=60'];

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

        const parseResults = (results: string) =>
            results
                .split('\n')
                .filter((s) => s.length > 0)
                .map((fullPath) => ({
                    testName: fullPath.split('/').reverse()[1],
                    path: fullPath.split('/').slice(0, -1).join('/'),
                    lastFetched: new Date().toISOString(),
                }));

        // TODO: consider `device_description.yaml` or `cluster_description.yaml`
        const findCommand = `'find -L ${connection.path} -mindepth 1 -maxdepth 3 -type f -name device_desc.yaml'`;
        const sshParams = [...defaultSshOptions, connection.host, '-p', connection.port.toString(), findCommand];

        const stdout = await runShellCommand('ssh', sshParams);

        return stdout ? parseResults(stdout.toString()) : [];
    };

    const syncRemoteFolder = async (connection?: RemoteConnection, remoteFolder?: RemoteFolder) => {
        if (!connection || !connection.host || !connection.port || !connection.path) {
            throw new Error('No connection provided');
        }

        if (!remoteFolder) {
            throw new Error('No remote folder provided');
        }

        const remote = await import('@electron/remote');

        const configDir = remote.app.getPath('userData');
        const localCopyPath = path.join(configDir, 'remote-tests/');

        if (!existsSync(localCopyPath)) {
            await mkdir(localCopyPath);
        }

        const sourcePath = `${connection.host}:${escapeWhitespace(remoteFolder.path)}`;
        const baseOptions = ['-az', '-e', `'ssh -p ${connection.port.toString()}'`];
        const pathOptions = ['--delete', `'${sourcePath}'`, escapeWhitespace(localCopyPath)];
        try {
            // Try first with the `-s` option
            await runShellCommand('rsync', ['-s', ...baseOptions, ...pathOptions]);
        } catch (err: any) {
            logging.info(
                `Initial RSYNC attempt failed: ${(err as Error)?.message ?? err?.toString() ?? 'Unknown error'}`,
            );

            // Try again, this time without `-s` option
            await runShellCommand('rsync', [...baseOptions, ...pathOptions]);
        }

        return path.join(localCopyPath, remoteFolder.testName);
    };

    return {
        testConnection,
        testRemoteFolder,
        syncRemoteFolder,
        listRemoteFolders,
    };
};

export default useRemoteConnection;
