import React from 'react';

import { Button, FormGroup, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { useSelector } from 'react-redux';
import usePerfAnalyzerFileLoader from 'renderer/hooks/usePerfAnalyzerFileLoader.hooks';
import { getSelectedFolderLocationType } from '../../../data/store/selectors/uiState.selectors';
import '../../scss/FolderPicker.scss';
import GraphSelector from '../graph-selector/GraphSelector';
import RemoteConnectionOptions from './RemoteConnectionOptions';

/** Implements a temporary wrapper around the Folder Loading component & Graph selection component, to provide state
 * and context that is not yet present in the App's higher-level components.
 *
 * TODO: Decouple graph selection from folder selection
 * */

export const PerfDataLoader = (): React.ReactElement => {
    const { loadPerfAnalyzerFolder, openPerfAnalyzerFolderDialog, error } = usePerfAnalyzerFileLoader();
    const selectedFolderLocationType = useSelector(getSelectedFolderLocationType);

    return (
        <div className='folder-picker-options'>
            <fieldset>
                <legend>Local folder</legend>
                <Icon icon={IconNames.FOLDER_OPEN} size={150} />
                <div className='folder-picker-wrapper'>
                    <FormGroup
                        label={<h3>Open a local folder</h3>}
                        labelFor='text-input'
                        subLabel='Select a local folder to load the performance data from.'
                    >
                        <div className='buttons-container'>
                            <FolderPicker
                                disabled={false}
                                onSelectFolder={async () => {
                                    const folderPath = await openPerfAnalyzerFolderDialog();

                                    await loadPerfAnalyzerFolder(folderPath);
                                }}
                            />
                            <GraphSelector disabled={selectedFolderLocationType === 'remote'} />
                            {error && (
                                <div className='loading-error'>
                                    <p>{error.toString()}</p>
                                </div>
                            )}
                        </div>
                    </FormGroup>
                </div>
            </fieldset>
            <fieldset>
                <legend>Remote Sync</legend>
                <Icon icon={IconNames.CLOUD} size={150} />
                <div className='folder-picker-wrapper'>
                    <RemoteConnectionOptions />
                </div>
            </fieldset>
        </div>
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
