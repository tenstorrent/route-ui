import { FC, useState } from 'react';

import { FormGroup } from '@blueprintjs/core';
import useAppConfig from '../../hooks/useAppConfig.hook';

import useLogging from '../../hooks/useLogging.hook';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import useRemoteConnection, { RemoteConnection, RemoteFolder } from '../../hooks/useRemoteConnection.hook';
import AddRemoteConnection from './AddRemoteConnection';
import RemoteConnectionSelector from './RemoteConnectionSelector';
import RemoteFolderSelector from './RemoteFolderSelector';

const RemoteConnectionOptions: FC = () => {
    const { getAppConfig, setAppConfig, deleteAppConfig } = useAppConfig();

    const getSavedRemoteFolders = (connection?: RemoteConnection) => {
        return JSON.parse(getAppConfig(`${connection?.name}-remoteFolders`) ?? '[]') as RemoteFolder[];
    };

    const savedConnections = JSON.parse(getAppConfig('remoteConnections') ?? '[]') as RemoteConnection[];
    const [selectedConnection, setSelectedConnection] = useState<RemoteConnection | undefined>(savedConnections[0]);
    const [remoteFolders, setRemoteFolders] = useState<RemoteFolder[]>(getSavedRemoteFolders(savedConnections[0]));
    const [selectedFolder, setSelectedFolder] = useState<RemoteFolder | undefined>(undefined);
    const { listRemoteFolders, syncRemoteFolder, checkLocalFolderExists } = useRemoteConnection();
    const [isSyncingRemoteFolder, setIsSyncingRemoteFolder] = useState(false);
    const [isLoadingFolderList, setIsLoadingFolderList] = useState(false);

    const logging = useLogging();
    const { loadPerfAnalyzerFolder, resetAvailableGraphs } = usePerfAnalyzerFileLoader();

    const updateSelectedFolder = async (folder?: RemoteFolder) => {
        setSelectedFolder(folder);

        if (checkLocalFolderExists(folder?.localPath)) {
            await loadPerfAnalyzerFolder(folder?.localPath);
        } else {
            resetAvailableGraphs();
        }
    };

    const updateSelectedConnection = async (connection: RemoteConnection) => {
        setSelectedConnection(connection);
        setRemoteFolders(getSavedRemoteFolders(connection));

        await updateSelectedFolder(getSavedRemoteFolders(connection)[0]);
    };

    const updateSavedRemoteFolders = async (
        connection?: RemoteConnection,
        folders?: RemoteFolder[],
        folder?: RemoteFolder,
    ) => {
        if (folder) {
            const syncDate = new Date().toISOString();
            const savedFolder = folders?.find((f) => f.localPath === folder?.localPath);

            if (savedFolder) {
                savedFolder.lastSynced = syncDate;
            }
        }

        const savedFolders = getSavedRemoteFolders(connection);
        const updatedFolders = (folders ?? []).map((updatedFolder) => {
            const existingFolder = savedFolders?.find((f) => f.localPath === updatedFolder.localPath);

            return {
                ...existingFolder,
                ...updatedFolder,
                ...(folder?.localPath === updatedFolder.localPath && { lastSynced: new Date().toISOString() }),
            };
        });

        if (!folders) {
            deleteAppConfig(`${connection?.name}-remoteFolders`);
        } else {
            setAppConfig(`${connection?.name}-remoteFolders`, JSON.stringify(updatedFolders));
        }

        setRemoteFolders(updatedFolders);

        await updateSelectedFolder(folder ?? updatedFolders[0]);
    };

    const updateSavedConnection = async (connection: RemoteConnection, isDeletingConnection = false) => {
        const updatedConnections = [...savedConnections];

        const updatedConnectionIndex = savedConnections.findIndex((c) => {
            const isSameName = c.name === connection?.name;
            const isSameHost = c.host === connection?.host;
            const isSamePort = c.port === connection?.port;

            return isSameName && isSameHost && isSamePort;
        });

        if (updatedConnectionIndex === -1) {
            updatedConnections.push(connection);
        } else {
            updatedConnections[updatedConnectionIndex] = connection;
        }

        if (isDeletingConnection) {
            updatedConnections.splice(updatedConnectionIndex, 1);
        }

        setAppConfig('remoteConnections', JSON.stringify(updatedConnections));

        await updateSelectedConnection(isDeletingConnection ? updatedConnections[0] : connection);
    };

    return (
        <>
            <FormGroup
                label={<h3>Add a remote sync server</h3>}
                labelFor='text-input'
                subLabel='Add a new server to the list of available ones. Those server will be used for syncing folders locally.'
            >
                <AddRemoteConnection
                    disabled={isLoadingFolderList || isSyncingRemoteFolder}
                    onAddConnection={async (newConnection) => {
                        const newConnections = [...savedConnections, newConnection];

                        setAppConfig('remoteConnections', JSON.stringify(newConnections));
                        await updateSelectedConnection(newConnection);
                    }}
                />
            </FormGroup>

            <FormGroup
                label={<h3>Use a remote sync server</h3>}
                labelFor='text-input'
                subLabel='Set the remote server that will be used for syncing folders.'
            >
                <RemoteConnectionSelector
                    connection={selectedConnection}
                    connections={savedConnections}
                    disabled={isLoadingFolderList || isSyncingRemoteFolder}
                    loading={isLoadingFolderList}
                    onEditConnection={(updatedConnection) => updateSavedConnection(updatedConnection)}
                    onRemoveConnection={async (connection) => {
                        await updateSavedRemoteFolders(connection);
                        await updateSavedConnection(connection, true);
                    }}
                    onSelectConnection={async (connection) => {
                        await updateSelectedConnection(connection);

                        try {
                            const fetchedRemoteFolders = await listRemoteFolders(connection);

                            await updateSavedRemoteFolders(connection, fetchedRemoteFolders);
                        } catch (err) {
                            logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');
                        }
                    }}
                    onSyncRemoteFolders={async () => {
                        setIsLoadingFolderList(true);
                        try {
                            const savedRemotefolders = await listRemoteFolders(selectedConnection);

                            await updateSavedRemoteFolders(selectedConnection, savedRemotefolders);
                        } catch (err) {
                            logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');

                            // eslint-disable-next-line no-alert
                            alert('Unable to connect to remote server.');
                        } finally {
                            setIsLoadingFolderList(false);
                        }
                    }}
                />
            </FormGroup>

            <FormGroup
                label={<h3>Select a remote folder</h3>}
                labelFor='text-input'
                subLabel="Select a folder to sync it's data."
            >
                <RemoteFolderSelector
                    remoteFolder={selectedFolder}
                    remoteFolders={remoteFolders}
                    loading={isSyncingRemoteFolder}
                    onSelectFolder={async (folder) => {
                        await updateSelectedFolder(folder);
                    }}
                    onSyncFolder={async () => {
                        setIsSyncingRemoteFolder(true);
                        try {
                            await syncRemoteFolder(selectedConnection, selectedFolder);

                            const savedRemoteFolders = JSON.parse(
                                getAppConfig(`${selectedConnection?.name}-remoteFolders`) ?? '[]',
                            ) as RemoteFolder[];

                            await updateSavedRemoteFolders(selectedConnection, savedRemoteFolders, selectedFolder);
                        } catch (err) {
                            logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');

                            // eslint-disable-next-line no-alert
                            alert('Unable to sync remote folder');
                        } finally {
                            setIsSyncingRemoteFolder(false);
                        }
                    }}
                />
            </FormGroup>
        </>
    );
};

export default RemoteConnectionOptions;
