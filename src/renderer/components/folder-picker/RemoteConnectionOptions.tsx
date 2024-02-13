import { FC, useEffect, useState } from 'react';

import { Button, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select2 } from '@blueprintjs/select';
import { Tooltip2 } from '@blueprintjs/popover2';

import RemoteFolderDialog from './RemoteFolderDialog';
import useAppConfig from '../../hooks/useAppConfig.hook';

import '../../scss/RemoteConnectionOptions.scss';
import useRemoteConnection, { RemoteFolder } from '../../hooks/useRemoteConnection.hook';
import useLogging from '../../hooks/useLogging.hook';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import PopoverMenu from '../PopoverMenu';

export interface RemoteConnection {
    name: string;
    host: string;
    port: number;
    path: string;
}

const formatConnectionString = (connection?: RemoteConnection) => {
    if (!connection) {
        return '(No connection)';
    }

    return `ssh://${connection.host}:${connection.port}/${connection.path}`;
};

const renderRemoteConnection: ItemRenderer<RemoteConnection> = (connection, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }

    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={formatConnectionString(connection)}
            onClick={handleClick}
            text={formatConnectionString(connection)}
        />
    );
};

const formatRemoteFolderName = (folder: RemoteFolder) => {
    return folder.testName;
};

const remoteFolderRenderer: ItemRenderer<RemoteFolder> = (folder, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }

    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={formatRemoteFolderName(folder)}
            onClick={handleClick}
            text={formatRemoteFolderName(folder)}
        />
    );
};

const RemoteConnectionOptions: FC = () => {
    const { getAppConfig, setAppConfig } = useAppConfig();

    const savedConnections = JSON.parse(getAppConfig('remoteConnections') ?? '[]') as RemoteConnection[];
    const [isRemoteFolderDialogOpen, setIsRemoteFolderDialogOpen] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<RemoteConnection | undefined>(savedConnections[0]);
    const [isEditingConnection, setIsEditingConnection] = useState(false);
    const [remoteTestFolders, setRemoteTestFolders] = useState<RemoteFolder[]>([]);
    const [selectedTestFolder, setSelectedTestFolder] = useState<RemoteFolder | undefined>(undefined);
    const { listRemoteFolders, syncRemoteFolder } = useRemoteConnection();
    const logging = useLogging();
    const { loadPerfAnalyzerFolder, loadPerfAnalyzerGraph, selectedGraph, availableGraphs, enableGraphSelect } =
        usePerfAnalyzerFileLoader();
    const [isSyncingRemoteFolder, setIsSyncingRemoteFolder] = useState(false);

    useEffect(() => {
        (async () => {
            if (!isSyncingRemoteFolder) {
                return;
            }

            try {
                const localFolder = await syncRemoteFolder(selectedConnection, selectedTestFolder);

                loadPerfAnalyzerFolder(localFolder);
            } catch (err) {
                logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');
            } finally {
                setIsSyncingRemoteFolder(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTestFolder, isSyncingRemoteFolder]);

    return (
        <div className='remote-connection-options'>
            <h3>Remote connection</h3>
            <div>
                <Button
                    icon={IconNames.PLUS}
                    text='Add new connection'
                    onClick={() => setIsRemoteFolderDialogOpen(true)}
                />
            </div>

            <div>
                <Select2
                    items={savedConnections}
                    itemRenderer={renderRemoteConnection}
                    filterable
                    onItemSelect={(connection) => {
                        setSelectedConnection(connection);
                    }}
                >
                    <Button
                        icon={IconNames.CLOUD}
                        rightIcon={IconNames.CARET_DOWN}
                        text={formatConnectionString(selectedConnection)}
                    />
                </Select2>
                <Tooltip2 content='Edit selected connection'>
                    <Button
                        icon={IconNames.EDIT}
                        disabled={!selectedConnection}
                        onClick={() => {
                            setIsEditingConnection(true);
                            setIsRemoteFolderDialogOpen(true);
                        }}
                    />
                </Tooltip2>
                <Tooltip2 content='Remove selected connection'>
                    <Button
                        icon={IconNames.TRASH}
                        disabled={!selectedConnection}
                        onClick={() => {
                            setAppConfig(
                                'remoteConnections',
                                JSON.stringify(savedConnections.filter((conn) => conn !== selectedConnection)),
                            );
                            setSelectedConnection(undefined);
                        }}
                    />
                </Tooltip2>
            </div>
            <Button
                icon={IconNames.LOG_IN}
                disabled={!selectedConnection}
                text='Open connection'
                intent='primary'
                onClick={async () => {
                    try {
                        const remoteFolder = await listRemoteFolders(selectedConnection);
                        setRemoteTestFolders(remoteFolder);
                        setSelectedTestFolder(remoteFolder[0]);
                    } catch (err) {
                        logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');
                    }
                }}
            />

            <div>
                <Select2
                    className='perf-results-remote-select'
                    items={remoteTestFolders}
                    itemRenderer={remoteFolderRenderer}
                    filterable
                    disabled={remoteTestFolders.length === 0}
                    onItemSelect={async (remotefolder) => setSelectedTestFolder(remotefolder)}
                >
                    <Button
                        icon={IconNames.FOLDER_OPEN}
                        rightIcon={IconNames.CARET_DOWN}
                        disabled={remoteTestFolders.length === 0}
                        text={selectedTestFolder ? formatRemoteFolderName(selectedTestFolder) : '(No selection)'}
                    />
                </Select2>
                <Tooltip2 content='Sync remote folder'>
                    <Button
                        icon={IconNames.REFRESH}
                        disabled={!selectedTestFolder && !isSyncingRemoteFolder}
                        onClick={() => setIsSyncingRemoteFolder(true)}
                    />
                </Tooltip2>
            </div>
            <PopoverMenu // Graph picker
                label='Select Graph'
                options={availableGraphs.map((graph) => graph.name)}
                selectedItem={selectedGraph}
                onSelectItem={loadPerfAnalyzerGraph}
                disabled={!enableGraphSelect}
            />
            <RemoteFolderDialog
                open={isRemoteFolderDialogOpen}
                onAddConnection={(newConnection) => {
                    setIsEditingConnection(false);
                    setAppConfig('remoteConnections', JSON.stringify([newConnection, ...savedConnections]));
                }}
                onClose={() => {
                    setIsRemoteFolderDialogOpen(false);
                    setIsEditingConnection(false);
                }}
                title={isEditingConnection ? 'Edit remote connection' : 'Add new remote connection'}
                remoteConnection={isEditingConnection ? selectedConnection : undefined}
            />
        </div>
    );
};

export default RemoteConnectionOptions;
