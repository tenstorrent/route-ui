// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

import { Button, Icon, MenuItem, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { type ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import { FC, type PropsWithChildren } from 'react';
import { type RemoteConnection, RemoteFolder } from '../../hooks/useRemote.hook';

const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
});

const formatRemoteFolderName = (folder?: RemoteFolder, connection?: RemoteConnection) => {
    if (!folder) {
        return 'n/a';
    }

    if (!connection) {
        return folder.testName;
    }

    return `${connection.name} — ${folder.testName}`;
};

const filterFolders =
    (connection?: RemoteConnection): ItemPredicate<RemoteFolder> =>
    (query, folder) => {
        return formatRemoteFolderName(folder, connection).toLowerCase().includes(query.toLowerCase());
    };

const isLocalFolderOutdated = (folder: RemoteFolder) => {
    if (!folder.lastSynced) {
        return true;
    }

    const lastSynced = new Date(folder.lastSynced);
    const lastModified = new Date(folder.lastModified);

    return lastModified > lastSynced;
};

const remoteFolderRenderer =
    (syncingFolderList: boolean, connection?: RemoteConnection): ItemRenderer<RemoteFolder> =>
    (folder, { handleClick, modifiers }) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }

        const { lastSynced, lastModified } = folder;

        let statusIcon = (
            <Tooltip2
                content={`Fetching folder status, last sync: ${
                    lastSynced ? formatter.format(new Date(lastSynced)) : 'Never'
                }`}
            >
                <Spinner size={16} />
            </Tooltip2>
        );

        if (!syncingFolderList) {
            if (isLocalFolderOutdated(folder)) {
                statusIcon = (
                    <Tooltip2
                        content={`Folder is stale, last sync: ${
                            lastSynced ? formatter.format(new Date(lastSynced)) : 'Never'
                        }`}
                    >
                        <Icon icon={IconNames.HISTORY} color='goldenrod' />
                    </Tooltip2>
                );
            } else {
                statusIcon = (
                    <Tooltip2
                        content={`Folder is up to date, last sync: ${
                            lastSynced ? formatter.format(new Date(lastSynced)) : 'Never'
                        }`}
                    >
                        <Icon icon={IconNames.UPDATED} color='green' />
                    </Tooltip2>
                );
            }
        }

        return (
            <MenuItem
                className='remote-folder-item'
                active={modifiers.active}
                disabled={modifiers.disabled}
                key={`${formatRemoteFolderName(folder, connection)}${lastSynced ?? lastModified}`}
                onClick={handleClick}
                text={formatRemoteFolderName(folder)}
                // @ts-expect-error - Hack abusing label, it actually works.
                label={statusIcon}
                labelClassName='remote-folder-status-icon'
            />
        );
    };

interface RemoteFolderSelectorProps {
    remoteFolder?: RemoteFolder;
    remoteFolders?: RemoteFolder[];
    remoteConnection?: RemoteConnection;
    loading?: boolean;
    updatingFolderList?: boolean;
    falbackLabel?: string;
    icon?: string;
    onSelectFolder: (folder: RemoteFolder) => void;
}

const RemoteFolderSelector: FC<PropsWithChildren<RemoteFolderSelectorProps>> = ({
    remoteFolder,
    remoteFolders,
    remoteConnection,
    loading,
    updatingFolderList = false,
    onSelectFolder,
    children,
    falbackLabel = '(No selection)',
    icon = IconNames.FOLDER_OPEN,
}) => {
    return (
        <div className='buttons-container'>
            <Select2
                className='remote-folder-select'
                items={remoteFolders ?? []}
                itemRenderer={remoteFolderRenderer(updatingFolderList, remoteConnection)}
                filterable
                itemPredicate={filterFolders(remoteConnection)}
                noResults={<MenuItem disabled text='No results' roleStructure='listoption' />}
                disabled={loading || remoteFolders?.length === 0}
                onItemSelect={onSelectFolder}
            >
                <Button
                    icon={icon as any}
                    rightIcon={remoteFolders && remoteFolders?.length > 0 ? IconNames.CARET_DOWN : undefined}
                    disabled={loading || remoteFolders?.length === 0}
                    text={remoteFolder ? formatRemoteFolderName(remoteFolder, remoteConnection) : falbackLabel}
                />
            </Select2>
            {children}
        </div>
    );
};

RemoteFolderSelector.defaultProps = {
    loading: false,
    updatingFolderList: false,
    remoteFolders: [],
    remoteFolder: undefined,
    remoteConnection: undefined,
    falbackLabel: undefined,
    icon: undefined,
};

export default RemoteFolderSelector;
