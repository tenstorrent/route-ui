import { FC } from 'react';
import { AnchorButton, Button, MenuItem } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ItemRenderer, Select2 } from '@blueprintjs/select';
import { IconNames } from '@blueprintjs/icons';
import { RemoteFolder } from '../../hooks/useRemoteConnection.hook';
import PopoverMenu from '../PopoverMenu';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';

const formatRemoteFolderName = (folder: RemoteFolder) => {
    return folder.testName;
};

const filterFolders: ItemPredicate<RemoteFolder> = (query, folder) => {
    return formatRemoteFolderName(folder).toLowerCase().includes(query.toLowerCase());
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

interface RemoteFolderSelectorProps {
    remoteFolder?: RemoteFolder;
    remoteFolders?: RemoteFolder[];
    loading?: boolean;
    onSelectFolder: (folder: RemoteFolder) => void;
    onSyncFolder: () => void;
}

const RemoteFolderSelector: FC<RemoteFolderSelectorProps> = ({
    remoteFolder,
    remoteFolders,
    loading,
    onSelectFolder,
    onSyncFolder,
}) => {
    const { loadPerfAnalyzerGraph, selectedGraph, availableGraphs } = usePerfAnalyzerFileLoader();

    return (
        <div className='buttons-container'>
            <Select2
                className='remote-folder-select'
                items={remoteFolders ?? []}
                itemRenderer={remoteFolderRenderer}
                filterable
                itemPredicate={filterFolders}
                noResults={<MenuItem disabled text='No results.' roleStructure='listoption' />}
                disabled={loading || remoteFolders?.length === 0}
                onItemSelect={onSelectFolder}
            >
                <Button
                    icon={IconNames.FOLDER_OPEN}
                    rightIcon={IconNames.CARET_DOWN}
                    disabled={loading || remoteFolders?.length === 0}
                    text={remoteFolder ? formatRemoteFolderName(remoteFolder) : '(No selection)'}
                />
            </Select2>
            <Tooltip2 content='Sync remote folder'>
                <AnchorButton
                    icon={IconNames.REFRESH}
                    loading={loading}
                    disabled={loading || !remoteFolder || remoteFolders?.length === 0}
                    onClick={() => onSyncFolder()}
                />
            </Tooltip2>

            <PopoverMenu
                label='Select Graph'
                options={availableGraphs.map((graph) => graph.name)}
                selectedItem={selectedGraph}
                onSelectItem={loadPerfAnalyzerGraph}
                disabled={loading || availableGraphs?.length === 0}
            />
        </div>
    );
};

RemoteFolderSelector.defaultProps = {
    loading: false,
    remoteFolders: [],
    remoteFolder: undefined,
};

export default RemoteFolderSelector;
