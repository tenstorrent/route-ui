// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { sep as pathSeparator } from 'path';

import { FormGroup } from '@blueprintjs/core';
import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFolderPathSelector, getSelectedFolderLocationType } from '../../../data/store/selectors/uiState.selectors';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import GraphSelector from '../graph-selector/GraphSelector';
import FolderPicker from './FolderPicker';

import './FolderPicker.scss';
import { sendEventToMain } from '../../utils/bridge';
import { ElectronEvents } from '../../../main/ElectronEvents';

const getTestName = (path: string) => {
    const lastFolder = path.split(pathSeparator).pop();
    return lastFolder || undefined;
};

const LocalFolderOptions: FC = () => {
    const { loadPerfAnalyzerFolder, openPerfAnalyzerFolderDialog, error, loadPerfAnalyzerGraph, loadTemporalEpoch } =
        usePerfAnalyzerFileLoader();
    const localFolderPath = useSelector(getFolderPathSelector);
    const selectedFolderLocationType = useSelector(getSelectedFolderLocationType);
    return (
        <FormGroup
            label={<h3>Select local folder</h3>}
            labelFor='text-input'
            subLabel='Select local folder to load netlist analyzer output and performance data from'
        >
            <div className='buttons-container'>
                <FolderPicker
                    onSelectFolder={async () => {
                        const folderPath = await openPerfAnalyzerFolderDialog();

                        await loadPerfAnalyzerFolder(folderPath);

                        if (folderPath) {
                            sendEventToMain(
                                ElectronEvents.UPDATE_WINDOW_TITLE,
                                `(Local Folder) — ${getTestName(folderPath)}`,
                            );
                        }
                    }}
                    text={selectedFolderLocationType === 'local' ? getTestName(localFolderPath) : undefined}
                />
                <GraphSelector
                    onSelectGraph={(state) => loadPerfAnalyzerGraph(state)}
                    onSelectTemporalEpoch={(state) => loadTemporalEpoch(state)}
                    disabled={selectedFolderLocationType === 'remote'}
                />
                {error && (
                    <div className='loading-error'>
                        <p>{error.toString()}</p>
                    </div>
                )}
            </div>
        </FormGroup>
    );
};

export default LocalFolderOptions;
