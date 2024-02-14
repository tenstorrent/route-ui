import { FC, useState } from 'react';

import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import RemoteFolderDialog from './RemoteFolderDialog';
import { RemoteConnection } from '../../hooks/useRemoteConnection.hook';

interface AddRemoteConnectionProps {
    disabled: boolean;
    onAddConnection: (connection: RemoteConnection) => void;
}

const AddRemoteConnection: FC<AddRemoteConnectionProps> = ({ disabled, onAddConnection }) => {
    const [isAddConnectionDialogOpen, setIsAddConnectionDialogOpen] = useState(false);

    return (
        <div>
            <Button
                icon={IconNames.PLUS}
                text='Add new connection'
                disabled={disabled}
                onClick={() => setIsAddConnectionDialogOpen(true)}
            />
            <RemoteFolderDialog
                open={isAddConnectionDialogOpen}
                onAddConnection={(newConnection) => {
                    onAddConnection(newConnection);
                    setIsAddConnectionDialogOpen(false);
                }}
                onClose={() => setIsAddConnectionDialogOpen(false)}
            />
        </div>
    );
};

export default AddRemoteConnection;
