import { FC, useState } from 'react';

import { Button, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select2 } from '@blueprintjs/select';

import RemoteFolderDialog from './RemoteFolderDialog';
import useAppConfig from '../../hooks/useAppConfig.hook';

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

const RemoteConnectionOptions: FC = () => {
    const { getAppConfig } = useAppConfig();

    const savedConnections = JSON.parse(getAppConfig('remoteConnections') ?? '[]') as RemoteConnection[];
    const [isRemoteFolderDialogOpen, setIsRemoteFolderDialogOpen] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<RemoteConnection | undefined>(savedConnections[0]);

    return (
        <div>
            <h3>Remote connection</h3>
            <div>
                <Select2
                    items={savedConnections}
                    itemRenderer={renderRemoteConnection}
                    filterable
                    onItemSelect={(connectionString) => {
                        setSelectedConnection(connectionString);
                    }}
                >
                    <Button
                        icon='data-lineage'
                        rightIcon='caret-down'
                        text={formatConnectionString(selectedConnection)}
                    />
                </Select2>
                <Button
                    icon={IconNames.EDIT}
                    text='Edit connection'
                    disabled={!selectedConnection}
                    onClick={() => {
                        console.log('Edit connection');
                    }}
                />
                <Button
                    icon={IconNames.DOCUMENT_OPEN}
                    text='Open connection'
                    intent='primary'
                    onClick={() => {
                        console.log('Open connection');
                    }}
                />
            </div>

            <Button
                icon={IconNames.CLOUD_DOWNLOAD}
                text='Add new connection'
                onClick={() => setIsRemoteFolderDialogOpen(true)}
            />
            <RemoteFolderDialog
                open={isRemoteFolderDialogOpen}
                onAddConnection={() => {
                    console.log('Add connection');
                }}
                onClose={() => setIsRemoteFolderDialogOpen(false)}
            />
        </div>
    );
};
