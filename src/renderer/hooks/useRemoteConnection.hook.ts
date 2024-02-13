import type { RemoteConnection } from '../components/folder-picker/RemoteConnectionOptions';

import {
    Workspace,
    syncRemoteTest,
    findRemoteDirectories,
    testWorkspaceConnection,
    verifyWorkspacePath,
    RemoteFolder,
} from '../components/Network';

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

const useRemoteConnection = () => {
    const testConnection = async (connection: RemoteConnection) => {
        const connectionStatus: ConnectionStatus = {
            status: ConnectionTestStates.IDLE,
            message: '',
        };

        connectionStatus.status = ConnectionTestStates.PROGRESS;

        try {
            await testWorkspaceConnection({
                sshHost: connection.host,
                sshPort: connection.port.toString(),
            } as Workspace);

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
            await verifyWorkspacePath({
                sshHost: connection.host,
                sshPort: connection.port.toString(),
                path: connection.path,
            } as Workspace);

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

        const folders = await findRemoteDirectories(connection);

        return folders;
    };

    const syncRemoteFolder = async (connection?: RemoteConnection, remoteFolder?: RemoteFolder) => {
        if (!connection || !connection.host || !connection.port || !connection.path) {
            throw new Error('No connection provided');
        }

        if (!remoteFolder) {
            throw new Error('No remote folder provided');
        }

        return syncRemoteTest(connection, remoteFolder);
    };

    return {
        testConnection,
        testRemoteFolder,
        syncRemoteFolder,
        listRemoteFolders,
    };
};

export default useRemoteConnection;
