import { AnchorButton, Button, MenuItem } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ItemRenderer, Select2 } from '@blueprintjs/select';
import { IconNames } from '@blueprintjs/icons';
import { FC, useState } from 'react';
import { RemoteConnection } from '../../hooks/useRemoteConnection.hook';
import RemoteFolderDialog from './RemoteFolderDialog';

const formatConnectionString = (connection?: RemoteConnection) => {
    if (!connection) {
        return '(No connection)';
    }

    return `ssh://${connection.host}:${connection.port}/${connection.path.replace(/^\//gi, '')}`;
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

interface RemoteConnectionSelectorProps {
    connections: RemoteConnection[];
    connection?: RemoteConnection;
    disabled: boolean;
    onSelectConnection: (connection: RemoteConnection) => void;
    onEditConnection: (connection: RemoteConnection) => void;
    onRemoveConnection: (connection: RemoteConnection) => void;
}

const RemoteConnectionSelector: FC<RemoteConnectionSelectorProps> = ({
    connections,
    connection,
    disabled,
    onSelectConnection,
    onEditConnection,
    onRemoveConnection,
}) => {
    const [isEditdialogOpen, setIsEditDialogOpen] = useState(false);
    const selectedConnection = connection ?? connections[0];

    return (
        <div>
            <Select2
                items={connections}
                itemRenderer={renderRemoteConnection}
                disabled={disabled}
                filterable
                onItemSelect={onSelectConnection}
            >
                <Button
                    icon={IconNames.CLOUD}
                    rightIcon={IconNames.CARET_DOWN}
                    disabled={disabled}
                    text={formatConnectionString(selectedConnection)}
                />
            </Select2>
            <Tooltip2 content='Edit selected connection'>
                <AnchorButton
                    icon={IconNames.EDIT}
                    disabled={disabled || !selectedConnection}
                    onClick={() => setIsEditDialogOpen(true)}
                />
            </Tooltip2>
            <Tooltip2 content='Remove selected connection'>
                <AnchorButton
                    icon={IconNames.TRASH}
                    disabled={disabled || !selectedConnection}
                    onClick={() => onRemoveConnection(selectedConnection)}
                />
            </Tooltip2>

            <RemoteFolderDialog
                open={isEditdialogOpen}
                onAddConnection={(updatedconnection) => {
                    setIsEditDialogOpen(false);
                    onEditConnection(updatedconnection);
                }}
                onClose={() => {
                    setIsEditDialogOpen(false);
                }}
                title='Edit remote connection'
                remoteConnection={selectedConnection}
            />
        </div>
    );
};

RemoteConnectionSelector.defaultProps = {
    connection: undefined,
};

export default RemoteConnectionSelector;
