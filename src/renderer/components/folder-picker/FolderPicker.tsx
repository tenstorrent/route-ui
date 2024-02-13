import React from 'react';

import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import usePerfAnalyzerFileLoader from 'renderer/hooks/usePerfAnalyzerFileLoader.hooks';
import '../../scss/FolderPicker.scss';
import PopoverMenu from '../PopoverMenu';
import RemoteConnectionOptions from './RemoteConnectionOptions';

/** Implements a temporary wrapper around the Folder Loading component & Graph selection component, to provide state
 * and context that is not yet present in the App's higher-level components.
 *
 * TODO: Decouple graph selection from folder selection
 * */

export const PerfDataLoader = (): React.ReactElement => {
    const { loadPerfAnalyzerFolder, loadPerfAnalyzerGraph, error, selectedGraph, availableGraphs, enableGraphSelect } =
        usePerfAnalyzerFileLoader();

    return (
        <>
            <div className='folder-load-container'>
                <h3>Local folder</h3>
                <FolderPicker disabled={false} onSelectFolder={loadPerfAnalyzerFolder} />
                <PopoverMenu // Graph picker
                    label='Select Graph'
                    options={availableGraphs.map((graph) => graph.name)}
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
            <div>
                <RemoteConnectionOptions />
            </div>
        </>
    );
};

interface FolderPickerProps {
    disabled: boolean;
    onSelectFolder: () => void;
}

const FolderPicker = ({ disabled, onSelectFolder }: FolderPickerProps): React.ReactElement => {
    return (
        <div className='folder-picker'>
            <Button
                className='load-folder-button'
                disabled={disabled}
                icon={IconNames.FOLDER_SHARED}
                onClick={onSelectFolder}
                text='Select a local folder'
            />
        </div>
    );
};

export default FolderPicker;
