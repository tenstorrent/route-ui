import { spawn } from 'child_process';
import path from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import dns from 'dns';

import type { RemoteConnection } from '../components/folder-picker/RemoteConnectionOptions';

import useLogging from './useLogging.hook';

// Required for connecting to a socket on localhost
dns.setDefaultResultOrder('ipv4first');

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
}

export const escapeWhitespace = (str: string) => str.replace(/(\s)/g, '\\$1');

export async function runShellCommand(cmd: string, params: string[]) {
    const command = spawn(cmd, params, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        windowsHide: true,
    });

    let stdout = '';
    // eslint-disable-next-line no-restricted-syntax
    for await (const data of command.stdout) {
        stdout += data;
    }

    let stderr = '';
    // eslint-disable-next-line no-restricted-syntax
    for await (const data of command.stderr) {
        stderr += data;
    }

    const exitCode = await new Promise<number>((resolve) => {
        command.on('close', (code) => {
            resolve(code ?? 0);
        });
    });

    if (exitCode !== 0 || stderr.length > 0) {
        throw Error(`Command failed: ${cmd} ${params.join(' ')}\n${stderr}`);
    }

    return stdout;
}

const useRemoteConnection = () => {
    const logging = useLogging();

    const testConnection = async (connection: RemoteConnection) => {
        const connectionStatus: ConnectionStatus = {
            status: ConnectionTestStates.IDLE,
            message: '',
        };

        connectionStatus.status = ConnectionTestStates.PROGRESS;

        try {
            await runShellCommand('ssh', [connection.host, '-p', connection.port.toString(), 'echo "connected"']);

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
            await runShellCommand('ssh', [
                connection.host,
                '-p',
                connection.port.toString(),
                'bash',
                '-c',
                `'ls ${connection.path}'`,
            ]);

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
                }));

        const findParams = [
            '-L',
            connection.path,
            '-mindepth',
            '1',
            '-maxdepth',
            '3',
            '-type',
            'f',
            '-name',
            // TODO: consider `device_description.yaml` or `cluster_description.yaml`
            'device_desc.yaml',
        ];

        const sshParams = [
            connection.host,
            '-p',
            connection.port.toString(),
            'bash',
            '-c',
            `'find ${findParams.join(' ')}'`,
        ];

        const [stdout] = await runShellCommand('ssh', sshParams);

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
        const baseOptions = [
            '-s',
            '-az',
            '-e',
            `'ssh -p ${connection.port.toString()}'`,
            '--delete',
            sourcePath,
            escapeWhitespace(localCopyPath),
        ];
        try {
            await runShellCommand('rsync', baseOptions);
        } catch (err: any) {
            logging.info(
                `Initial RSYNC attempt failed: ${(err as Error)?.message ?? err?.toString() ?? 'Unknown error'}`,
            );

            // Try again, this time without `-s` option & quotes around source path
            baseOptions[5] = `'${baseOptions[5]}'`;
            await runShellCommand('rsync', baseOptions.slice(1));
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
