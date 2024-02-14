import { FC, useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, FormGroup, Icon, IconName, InputGroup } from '@blueprintjs/core';

import useRemoteConnection, {
    ConnectionStatus,
    ConnectionTestStates,
    RemoteConnection,
} from '../../hooks/useRemoteConnection.hook';
import useLogging from '../../hooks/useLogging.hook';

const ConnectionTestMessage: FC<ConnectionStatus> = ({ status, message }) => {
    const iconMap: Record<ConnectionTestStates, { icon: IconName; color: string }> = {
        [ConnectionTestStates.IDLE]: { icon: 'dot', color: 'grey' },
        [ConnectionTestStates.PROGRESS]: { icon: 'dot', color: 'yellow' },
        [ConnectionTestStates.FAILED]: { icon: 'cross', color: 'red' },
        [ConnectionTestStates.OK]: { icon: 'tick', color: 'green' },
    };
    const icon = iconMap[status] || { icon: 'dot', color: 'blue' };

    return (
        <div className='verify-connection-item'>
            <Icon icon={icon.icon} color={icon.color} size={20} />
            <span className='verify-text'>{message}</span>
        </div>
    );
};

interface RemoteFolderDialogProps {
    title?: string;
    open: boolean;
    onClose: () => void;
    onAddConnection: (connection: RemoteConnection) => void;
    remoteConnection?: RemoteConnection;
}

const RemoteFolderDialog: FC<RemoteFolderDialogProps> = ({
    open,
    onClose,
    onAddConnection,
    title = 'Add new remote connection',
    remoteConnection,
}) => {
    const [connection, setConnection] = useState(remoteConnection ?? { name: '', host: '', port: 22, path: '' });
    const [connectionTests, setConnectionTests] = useState<ConnectionStatus[]>([
        { status: ConnectionTestStates.IDLE, message: 'Test connection' },
        { status: ConnectionTestStates.IDLE, message: 'Test remote folder path' },
    ]);
    const { testConnection, testRemoteFolder } = useRemoteConnection();
    const logging = useLogging();

    const isValidConnection = connectionTests.every((status) => status.status === ConnectionTestStates.OK);

    const testConnectionStatus = async () => {
        const sshProgressStatus = { status: ConnectionTestStates.PROGRESS, message: 'Testing connection' };
        const folderProgressStatus = { status: ConnectionTestStates.PROGRESS, message: 'Testing remote folder path' };

        setConnectionTests([sshProgressStatus, folderProgressStatus]);

        try {
            const sshStatus = await testConnection(connection);
            let folderStatus = folderProgressStatus;

            if (sshStatus.status === ConnectionTestStates.FAILED) {
                folderStatus = { status: ConnectionTestStates.FAILED, message: 'Could not connecto SSH server' };
            }

            setConnectionTests([sshStatus, folderStatus]);

            if (sshStatus.status === ConnectionTestStates.OK) {
                folderStatus = await testRemoteFolder(connection);

                setConnectionTests([sshStatus, folderStatus]);
            }
        } catch (err) {
            logging.error((err as Error)?.message ?? err?.toString() ?? 'Unknown error');

            setConnectionTests([
                { status: ConnectionTestStates.FAILED, message: 'Connection failed' },
                { status: ConnectionTestStates.FAILED, message: 'Remote folder path failed' },
            ]);
        }
    };

    return (
        <Dialog
            className='bp4-dark'
            title={title}
            icon='info-sign'
            canOutsideClickClose={false}
            isOpen={open}
            onClose={onClose}
        >
            <DialogBody>
                <FormGroup
                    label='Name'
                    labelFor='text-input'
                    labelInfo='(Required)'
                    subLabel='The name for this connection.'
                >
                    <InputGroup
                        key='name'
                        value={connection.name}
                        onChange={(e) => setConnection({ ...connection, name: e.target.value })}
                    />
                </FormGroup>
                <FormGroup
                    label='SSH Host'
                    labelFor='text-input'
                    labelInfo='(Required)'
                    subLabel='The SSH host name, like: localhost.'
                >
                    <InputGroup
                        key='host'
                        value={connection.host}
                        onChange={(e) => setConnection({ ...connection, host: e.target.value })}
                    />
                </FormGroup>
                <FormGroup
                    label='SSH Port'
                    labelFor='text-input'
                    labelInfo='(Required)'
                    subLabel='The port to use for the SSH connection. Usually port 22.'
                >
                    <InputGroup
                        key='port'
                        value={connection.port.toString()}
                        onChange={(e) => {
                            const number = Number.parseInt(e.target.value, 10);

                            if (number > 0 && number < 99999) {
                                setConnection({ ...connection, port: number });
                            } else {
                                setConnection({ ...connection, port: 22 });
                            }
                        }}
                    />
                </FormGroup>
                <FormGroup
                    label='Remote Folder path'
                    labelFor='text-input'
                    labelInfo='(Required)'
                    subLabel='The path to the remote folder, typically $HOME/work/ll-sw.\nThis is the folder where the tests data is stored.'
                >
                    <InputGroup
                        key='path'
                        value={connection.path}
                        onChange={(e) => setConnection({ ...connection, path: e.target.value })}
                    />
                </FormGroup>
                <fieldset>
                    <legend>Test Connection</legend>

                    <ConnectionTestMessage status={connectionTests[0].status} message={connectionTests[0].message} />
                    <ConnectionTestMessage status={connectionTests[1].status} message={connectionTests[1].message} />

                    <Button intent='primary' text='Test Connection' onClick={testConnectionStatus} />
                </fieldset>
            </DialogBody>
            <DialogFooter
                minimal
                actions={
                    <>
                        <Button intent='danger' text='Close' onClick={onClose} />
                        <Button
                            intent='primary'
                            text='Add connection'
                            onClick={() => {
                                if (isValidConnection) {
                                    onAddConnection(connection);
                                    onClose();
                                }
                            }}
                        />
                    </>
                }
            />
        </Dialog>
    );
};

RemoteFolderDialog.defaultProps = {
    title: 'Add new remote connection',
    remoteConnection: undefined,
};

export default RemoteFolderDialog;
