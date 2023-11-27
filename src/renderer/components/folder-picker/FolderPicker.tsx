import React from 'react';

import { Button, ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Classes, Popover2, Tooltip2 } from '@blueprintjs/popover2';
import { Architecture } from 'data/Types';
import { validatePerfResultsFolder } from 'utils/Files';

import { useRenderChip } from 'renderer/hooks/useRenderChip';
import '../../scss/FolderPicker.scss';
import PopoverMenu from '../PopoverMenu';
import { DataLoadCallback, useFolderPicker } from '../../hooks/useFolderPicker.hooks';

/** Implements a temporary wrapper around the Folder Loading component & Graph selection component, to provide state
 * and context that is not yet present in the App's higher-level components.
 *
 * TODO: Decouple graph selection from folder selection
 * */

type FolderLoadingContextProps = {
    onDataLoad: DataLoadCallback;
};
export const TempFolderLoadingContext = (): React.ReactElement => {
    const { renderFromChip } = useRenderChip();
    const {
        manualArchitectureSelection,
        loadFolder,
        selectedArchitecture,
        handleSelectArchitecture,
        availableGraphs,
        selectedGraph,
        onSelectGraphName,
        showGraphSelect,
        error,
    } = useFolderPicker(renderFromChip);

    return (
        <div className='folder-load-container'>
            <h3>Load From Folder</h3>

            <FolderPicker
                disabled={false}
                onSelectFolder={loadFolder}
                disabledText='Select Architecture Before Loading Graph'
            />
            {manualArchitectureSelection && (
                <div>
                    <div className='auto-architecture-id-fail'>
                        <p>Unable to identify Architecture - select below</p>
                    </div>
                    <Tooltip2 content='Select Architecture' position='left'>
                        <ButtonGroup className='architecture-button-group'>
                            <Button
                                icon='person'
                                active={selectedArchitecture === Architecture.GRAYSKULL}
                                onClick={() => handleSelectArchitecture(Architecture.GRAYSKULL)}
                                className='architecture-button'
                            >
                                Grayskull
                            </Button>
                            <Button
                                icon='globe-network'
                                active={selectedArchitecture === Architecture.WORMHOLE}
                                onClick={() => handleSelectArchitecture(Architecture.WORMHOLE)}
                                className='architecture-button'
                            >
                                Wormhole
                            </Button>
                        </ButtonGroup>
                    </Tooltip2>
                </div>
            )}
            <PopoverMenu // Graph picker
                label='Select Graph'
                options={availableGraphs}
                selectedItem={selectedGraph}
                onSelectItem={onSelectGraphName}
                disabled={!showGraphSelect || !selectedArchitecture}
            />
            {error && (
                <div className='loading-error'>
                    <p>{error.toString()}</p>
                </div>
            )}
        </div>
    );
};

interface FolderPickerProps {
    disabled: boolean;
    disabledText: string;
    onSelectFolder: (folderPath: string) => void;
}

const FolderPicker = ({ disabled, disabledText, onSelectFolder }: FolderPickerProps): React.ReactElement => {
    const selectLocalFolder = async () => {
        const remote = await import('@electron/remote');
        const openDialogResult = await remote.dialog.showOpenDialog({
            properties: ['openDirectory'],
        });

        // if nothing was selected, return
        if (!openDialogResult) {
            return;
        }
        const folderPath = openDialogResult.filePaths[0] || null;
        if (!folderPath) {
            return;
        }

        const [isValid, err] = await validatePerfResultsFolder(folderPath);
        if (!isValid) {
            alert(`Invalid folder selected: ${err}`);
            return;
        }
        onSelectFolder(folderPath);
    };
    return (
        <div className='folder-picker'>
            <Popover2
                position='right'
                content={
                    <div className={Classes.POPOVER2_DISMISS}>
                        <Button icon={IconNames.FOLDER_OPEN} text='Local' onClick={() => selectLocalFolder()} />
                        <Button icon={IconNames.CLOUD_DOWNLOAD} text='Remote' disabled />
                    </div>
                }
                disabled={disabled}
            >
                <Tooltip2 disabled={!disabled} content={disabledText} placement='bottom'>
                    <Button
                        className='load-folder-button'
                        disabled={disabled}
                        icon={IconNames.FOLDER_SHARED}
                        text='Load Perf Results Folder'
                    />
                </Tooltip2>
            </Popover2>
        </div>
    );
};

export default FolderPicker;
