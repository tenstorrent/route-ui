import { FC, useState } from 'react';

import { FormGroup } from '@blueprintjs/core';
import useAppConfig from '../../hooks/useAppConfig.hook';

import useRemoteConnection, { RemoteConnection, RemoteFolder } from '../../hooks/useRemoteConnection.hook';
import useLogging from '../../hooks/useLogging.hook';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import AddRemoteConnection from './AddRemoteConnection';
import RemoteConnectionSelector from './RemoteConnectionSelector';
import RemoteFolderSelector from './RemoteFolderSelector';

const RemoteConnectionOptions: FC = () => {
    const { getAppConfig, setAppConfig } = useAppConfig();

    const savedConnections = JSON.parse(getAppConfig('remoteConnections') ?? '[]') as RemoteConnection[];
    const [selectedConnection, setSelectedConnection] = useState<RemoteConnection | undefined>(savedConnections[0]);
    const [remoteFolders, setRemoteFolders] = useState<RemoteFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<RemoteFolder | undefined>(undefined);
    const { listRemoteFolders, syncRemoteFolder } = useRemoteConnection();
    const [isSyncingRemoteFolder, setIsSyncingRemoteFolder] = useState(false);
    const [isLoadingFolderList, setIsLoadingFolderList] = useState(false);

    const logging = useLogging();
    const { loadPerfAnalyzerFolder } = usePerfAnalyzerFileLoader();

    return (
        <>
            <FormGroup
                label={<h3>Add a remote sync server</h3>}
                labelFor='text-input'
                subLabel='Add a new server to the list of available ones. Those server will be used for syncing folders locally.'
            >
                <AddRemoteConnection
                    disabled={isLoadingFolderList || isSyncingRemoteFolder}
                    onAddConnection={(newConnection) => {
                        const newConnections = [...savedConnections, newConnection];

                        setAppConfig('remoteConnections', JSON.stringify(newConnections));
                        setSelectedConnection(newConnection);
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
                    onEditConnection={(newConnection) => {
                        const newConnections = savedConnections.map((c) => {
                            const isSameName = c.name === newConnection.name;
                            const isSameHost = c.host === newConnection.host;
                            const isSamePort = c.port === newConnection.port;

                            if (isSameName && isSameHost && isSamePort) {
                                return newConnection;
                            }

                            return c;
                        });

                        setAppConfig('remoteConnections', JSON.stringify(newConnections));
                        setSelectedConnection(newConnection);
                    }}
                    onRemoveConnection={(connection) => {
                        const newConnections = savedConnections.filter((c) => {
                            const isSameName = c.name === connection.name;
                            const isSameHost = c.host === connection.host;
                            const isSamePort = c.port === connection.port;

                            return !(isSameName && isSameHost && isSamePort);
                        });

                        setAppConfig('remoteConnections', JSON.stringify(newConnections));
                        setSelectedConnection(newConnections[0]);
                    }}
                    onSelectConnection={(connection) => setSelectedConnection(connection)}
                    onSyncRemoteFolders={async () => {
                        setIsLoadingFolderList(true);
                        try {
                            const remoteFolder = await listRemoteFolders(selectedConnection);
                            setRemoteFolders(remoteFolder);
                            setSelectedFolder(remoteFolder[0]);
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
                    onSelectFolder={(folder) => setSelectedFolder(folder)}
                    onSyncFolder={async () => {
                        setIsSyncingRemoteFolder(true);
                        try {
                            const localFolder = await syncRemoteFolder(selectedConnection, selectedFolder);

                            await loadPerfAnalyzerFolder(localFolder);
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
