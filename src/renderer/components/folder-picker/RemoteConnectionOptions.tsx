import { FC, useEffect, useState } from 'react';

import { AnchorButton, FormGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import { useDispatch, useSelector } from 'react-redux';
import { getSelectedFolderLocationType } from '../../../data/store/selectors/uiState.selectors';
import { setSelectedFolderLocationType } from '../../../data/store/slices/uiState.slice';
import { checkLocalFolderExists } from '../../../utils/FileLoaders';
import useLogging from '../../hooks/useLogging.hook';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import useRemoteConnection, { RemoteConnection, RemoteFolder } from '../../hooks/useRemoteConnection.hook';
import GraphSelector from '../graph-selector/GraphSelector';
import AddRemoteConnection from './AddRemoteConnection';
import RemoteConnectionSelector from './RemoteConnectionSelector';
import RemoteFolderSelector from './RemoteFolderSelector';

const RemoteConnectionOptions: FC = () => {
    const remoteConnection = useRemoteConnection();

    const dispatch = useDispatch();
    const savedConnections = remoteConnection.getSavedConnections();
    const selectedConnection = remoteConnection.getSelectedConnection();
    const [remoteFolders, setRemoteFolders] = useState<RemoteFolder[]>(
        remoteConnection.getSavedRemoteFolders(selectedConnection),
    );
    const [selectedFolder, setSelectedFolder] = useState<RemoteFolder | undefined>(undefined);
    const selectedFolderLocationType = useSelector(getSelectedFolderLocationType);
    const [isSyncingRemoteFolder, setIsSyncingRemoteFolder] = useState(false);
    const [isLoadingFolderList, setIsLoadingFolderList] = useState(false);
    const [isFetchingFolderStatus, setIsFetchingFolderStatus] = useState(false);

    const logging = useLogging();
    const { loadPerfAnalyzerFolder, resetAvailableGraphs } = usePerfAnalyzerFileLoader();

    const updateSelectedFolder = async (folder?: RemoteFolder) => {
        setSelectedFolder(folder);
        dispatch(setSelectedFolderLocationType('remote'));

        if (checkLocalFolderExists(folder?.localPath)) {
            await loadPerfAnalyzerFolder(folder?.localPath, 'remote');
        } else {
            resetAvailableGraphs();
        }
    };

    const updateSelectedConnection = async (connection: RemoteConnection) => {
        remoteConnection.setSelectedConnection(connection);
        setRemoteFolders(remoteConnection.getSavedRemoteFolders(connection));

        await updateSelectedFolder(remoteConnection.getSavedRemoteFolders(connection)[0]);
    };

    const updateSavedRemoteFolders = (connection: RemoteConnection | undefined, updatedFolders: RemoteFolder[]) => {
        if (!connection) {
            return [];
        }

        const savedFolders = remoteConnection.getSavedRemoteFolders(connection);
        const mergedFolders = (updatedFolders ?? []).map((updatedFolder) => {
            const existingFolder = savedFolders?.find((f) => f.localPath === updatedFolder.localPath);

            return {
                ...existingFolder,
                ...updatedFolder,
            };
        });

        remoteConnection.setSavedRemoteFolders(connection, mergedFolders);
        setRemoteFolders(mergedFolders);

        return mergedFolders;
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

        remoteConnection.setSavedConnections(updatedConnections);

        await updateSelectedConnection(isDeletingConnection ? updatedConnections[0] : connection);
    };

    useEffect(() => {
        (async () => {
            try {
                setIsFetchingFolderStatus(true);
                const updatedRemoteFolders = await remoteConnection.listRemoteFolders(selectedConnection);

                updateSavedRemoteFolders(selectedConnection!, updatedRemoteFolders);
            } catch (err) {
                logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');
            } finally {
                setIsFetchingFolderStatus(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <FormGroup
                label={<h3>Add remote sync server</h3>}
                labelFor='text-input'
                subLabel='Add new server connection details'
            >
                <AddRemoteConnection
                    disabled={isLoadingFolderList || isSyncingRemoteFolder}
                    onAddConnection={async (newConnection) => {
                        const newConnections = [...savedConnections, newConnection];

                        remoteConnection.setSavedConnections(newConnections);
                        await updateSelectedConnection(newConnection);
                    }}
                />
            </FormGroup>

            <FormGroup
                label={<h3>Use remote sync server</h3>}
                labelFor='text-input'
                subLabel='Select remote server that will be used for syncing folders'
            >
                <RemoteConnectionSelector
                    connection={selectedConnection}
                    connections={savedConnections}
                    disabled={isLoadingFolderList || isSyncingRemoteFolder}
                    loading={isLoadingFolderList}
                    onEditConnection={(updatedConnection) => updateSavedConnection(updatedConnection)}
                    onRemoveConnection={async (connection) => {
                        await updateSelectedFolder(undefined);
                        await updateSavedConnection(connection, true);
                        remoteConnection.deleteSavedRemoteFolders(connection);
                    }}
                    onSelectConnection={async (connection) => {
                        await updateSelectedConnection(connection);

                        try {
                            const fetchedRemoteFolders = await remoteConnection.listRemoteFolders(connection);
                            const updatedFolders = updateSavedRemoteFolders(connection, fetchedRemoteFolders);

                            await updateSelectedFolder(updatedFolders[0]);
                        } catch (err) {
                            logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');
                        }
                    }}
                    onSyncRemoteFolders={async () => {
                        setIsLoadingFolderList(true);
                        try {
                            const savedRemotefolders = await remoteConnection.listRemoteFolders(selectedConnection);
                            const updatedfolders = updateSavedRemoteFolders(selectedConnection, savedRemotefolders);

                            await updateSelectedFolder(updatedfolders[0]);
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
                label={<h3>Select remote folder</h3>}
                labelFor='text-input'
                subLabel='Select folder to sync data from'
            >
                <RemoteFolderSelector
                    remoteFolder={selectedFolder}
                    remoteFolders={remoteFolders}
                    loading={isSyncingRemoteFolder}
                    updatingFolderList={isFetchingFolderStatus}
                    onSelectFolder={async (folder) => {
                        await updateSelectedFolder(folder);
                    }}
                >
                    <Tooltip2 content='Sync remote folder'>
                        <AnchorButton
                            icon={IconNames.REFRESH}
                            loading={isSyncingRemoteFolder}
                            disabled={isSyncingRemoteFolder || !selectedFolder || remoteFolders?.length === 0}
                            onClick={async () => {
                                setIsSyncingRemoteFolder(true);
                                try {
                                    await remoteConnection.syncRemoteFolder(selectedConnection, selectedFolder);

                                    const savedRemoteFolders =
                                        remoteConnection.getSavedRemoteFolders(selectedConnection);

                                    savedRemoteFolders.find(
                                        (f) => f.localPath === selectedFolder?.localPath,
                                    )!.lastSynced = new Date().toISOString();

                                    updateSavedRemoteFolders(selectedConnection, savedRemoteFolders);

                                    await updateSelectedFolder(selectedFolder);
                                } catch (err) {
                                    logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');

                                    // eslint-disable-next-line no-alert
                                    alert('Unable to sync remote folder');
                                } finally {
                                    setIsSyncingRemoteFolder(false);
                                }
                            }}
                        />
                    </Tooltip2>
                    <GraphSelector disabled={selectedFolderLocationType === 'local' || isSyncingRemoteFolder} />
                </RemoteFolderSelector>
            </FormGroup>
        </>
    );
};

export default RemoteConnectionOptions;
