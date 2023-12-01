import React from 'react';

import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Classes, Popover2, Tooltip2 } from '@blueprintjs/popover2';

import usePerfAnalyzerFileLoader from 'renderer/hooks/usePerfAnalyzerFileLoader.hooks';
import '../../scss/FolderPicker.scss';
import PopoverMenu from '../PopoverMenu';

/** Implements a temporary wrapper around the Folder Loading component & Graph selection component, to provide state
 * and context that is not yet present in the App's higher-level components.
 *
 * TODO: Decouple graph selection from folder selection
 * */

export const TempFolderLoadingContext = (): React.ReactElement => {
    const { loadPerfAnalyzerFolder, loadPerfAnalyzerGraph, error, selectedGraph, availableGraphs, enableGraphSelect } =
        usePerfAnalyzerFileLoader();

    return (
        <div className='folder-load-container'>
            <h3>Load From Folder</h3>

            <FolderPicker disabled={false} onSelectFolder={loadPerfAnalyzerFolder} disabledText='' />
            <PopoverMenu // Graph picker
                label='Select Graph'
                options={availableGraphs}
                selectedItem={selectedGraph}
                onSelectItem={loadPerfAnalyzerGraph}
                disabled={!enableGraphSelect}
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
    onSelectFolder: () => void;
}

const FolderPicker = ({ disabled, disabledText, onSelectFolder }: FolderPickerProps): React.ReactElement => {
    return (
        <div className='folder-picker'>
            <Popover2
                position='right'
                content={
                    <div className={Classes.POPOVER2_DISMISS}>
                        <Button icon={IconNames.FOLDER_OPEN} text='Local' onClick={onSelectFolder} />
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
