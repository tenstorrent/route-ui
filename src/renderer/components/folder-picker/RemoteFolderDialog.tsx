import { FC, useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, FormGroup, Icon, IconName, InputGroup } from '@blueprintjs/core';

import type { RemoteConnection } from './RemoteConnectionOptions';

enum VerifStatus {
    IDLE,
    PROGRESS,
    FAILED,
    OK,
}

interface VerifyItemProps {
    itemStatus: VerifStatus;
    text: string;
    connectionError: string | undefined;
}

const VerifyItem: FC<VerifyItemProps> = ({ itemStatus, text, connectionError }) => {
    const iconMap: Record<VerifStatus, { icon: IconName; color: string }> = {
        [VerifStatus.IDLE]: { icon: 'dot', color: 'grey' },
        [VerifStatus.PROGRESS]: { icon: 'dot', color: 'yellow' },
        [VerifStatus.FAILED]: { icon: 'cross', color: 'red' },
        [VerifStatus.OK]: { icon: 'tick', color: 'green' },
    };
    const icon = iconMap[itemStatus] || { icon: 'dot', color: 'blue' };

    return (
        <div className='verify-connection-item'>
            <Icon icon={icon.icon} color={icon.color} size={20} />
            <div className='verify-text'>{text}</div>
            <div className='verify-error'>{itemStatus === VerifStatus.FAILED && connectionError}</div>
        </div>
    );
};

interface RemoteFolderDialogProps {
    title?: string;
    open: boolean;
    onClose: () => void;
    onAddConnection: (connection: RemoteConnection) => void;
    name?: string;
    host?: string;
    port?: number;
    path?: string;
}

const RemoteFolderDialog: FC<RemoteFolderDialogProps> = ({
    open,
    onClose,
    onAddConnection,
    title = 'Add new remote connection',
    name: initialName,
    host: initialHost,
    port: initialPort,
    path: initialPath,
}) => {
    const [name, setName] = useState(initialName ?? '');
    const [host, setHost] = useState(initialHost ?? '');
    const [port, setPort] = useState(initialPort ?? 22);
    const [path, setPath] = useState(initialPath ?? '');
    const [isValidConnection, setIsValidConnection] = useState(false);

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
                    <InputGroup key='name' value={name} onChange={(e) => setName(e.target.value)} />
                </FormGroup>
                <FormGroup
                    label='SSH Host'
                    labelFor='text-input'
                    labelInfo='(Required)'
                    subLabel='The SSH host name, like: localhost.'
                >
                    <InputGroup key='host' value={host} onChange={(e) => setHost(e.target.value)} />
                </FormGroup>
                <FormGroup
                    label='SSH Port'
                    labelFor='text-input'
                    labelInfo='(Required)'
                    subLabel='The port to use for the SSH connection. Usually port 22.'
                >
                    <InputGroup
                        key='port'
                        value={port.toString()}
                        onChange={(e) => {
                            const number = Number.parseInt(e.target.value, 10);

                            if (number > 0 && number < 99999) {
                                setPort(number);
                            } else {
                                setPort(22);
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
                    <InputGroup key='path' value={path} onChange={(e) => setPath(e.target.value)} />
                </FormGroup>
                <fieldset>
                    <legend>Test Connection</legend>

                    <VerifyItem itemStatus={VerifStatus.IDLE} text='Test connection' connectionError={undefined} />
                    <VerifyItem
                        itemStatus={VerifStatus.IDLE}
                        text='Test remote folder path'
                        connectionError={undefined}
                    />

                    <Button
                        intent='primary'
                        text='Test Connection'
                        onClick={() => {
                            console.log('Test Connection');
                        }}
                    />
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
                            onClick={() => onAddConnection({ name, host, port, path })}
                        />
                    </>
                }
            />
        </Dialog>
    );
};

RemoteFolderDialog.defaultProps = {
    title: 'Add new remote connection',
    name: undefined,
    host: undefined,
    port: undefined,
    path: undefined,
};

export default RemoteFolderDialog;
