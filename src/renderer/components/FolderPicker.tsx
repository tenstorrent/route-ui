import React from 'react';

import path from 'path';

import { Button, ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Classes, Popover2, Tooltip2 } from '@blueprintjs/popover2';
import { useDispatch, useSelector } from 'react-redux';
import {
    getArchitectureSelector,
    getFileNameSelector,
    getFilePathSelector,
} from 'data/store/selectors/uiState.selectors';
import { setSelectedArchitecture, setSelectedFileName, setSelectedFolder } from 'data/store/slices/uiState.slice';

import '../scss/FolderPicker.scss';

import { getAvailableGraphNames, loadJsonFile, validatePerfResultsFolder } from 'utils/Files';
import Chip from '../../data/Chip';
import { Architecture } from '../../data/Types';
import { ChipDesignJSON } from '../../data/JSONDataTypes';
import { GraphDescriptorJSON } from '../../data/sources/GraphDescriptor';
import { QueueDescriptorJson } from '../../data/sources/QueueDescriptor';
import PopoverMenu from './PopoverMenu';
import type {
    OpAttributesJSON,
    OpMeasurementsJSON,
    PerfAnalyzerResultsJson,
} from '../../data/sources/PerfAnalyzerResults';
import { PerfAnalyzerResultsPerOpJSON } from '../../data/sources/PerfAnalyzerResults';

const loadChipFromArchitecture = async (architecture: Architecture): Promise<Chip> => {
    if (architecture === Architecture.NONE) {
        throw new Error('No architecture provided.');
    }
    const grayskullArch = await import('../../data/architectures/arch-grayskull.json');
    const wormholeArch = await import('../../data/architectures/arch-wormhole.json');

    const architectureJson = {
        [Architecture.GRAYSKULL]: grayskullArch.default,
        [Architecture.WORMHOLE]: wormholeArch.default,
    }[architecture];
    return Chip.CREATE_FROM_CHIP_DESIGN(architectureJson as ChipDesignJSON);
};

const loadGraph = async (folderPath: string, graphName: string, architecture: Architecture): Promise<Chip> => {
    let chip = await loadChipFromArchitecture(architecture);
    const graphPath = path.join(folderPath, 'graph_descriptor', graphName, 'cores_to_ops.json');
    const graphDescriptorJson = await loadJsonFile(graphPath);

    chip = Chip.AUGMENT_FROM_GRAPH_DESCRIPTOR(chip, graphDescriptorJson as GraphDescriptorJSON);

    const queuesPath = path.join(folderPath, 'queue_descriptor', 'queue_descriptor.json');
    const queueDescriptorJson = await loadJsonFile(queuesPath);

    chip = Chip.AUGMENT_WITH_QUEUE_DETAILS(chip, queueDescriptorJson as QueueDescriptorJson);

    const analyzerResultsPath = path.join(folderPath, 'analyzer_results', graphName, 'graph_perf_report_per_op.json');
    const analyzerResultsJson = (await loadJsonFile(analyzerResultsPath)) as PerfAnalyzerResultsPerOpJSON;
    const opAttributesMeasurements: Map<
        string,
        {
            opAttributes: OpAttributesJSON;
            opMeasurements: OpMeasurementsJSON;
        }
    > = new Map();
    const analyzerResultsJsonWithChipIds: PerfAnalyzerResultsJson = Object.fromEntries(
        Object.entries(analyzerResultsJson)
            .map(([opName, result]) => {
                opAttributesMeasurements.set(opName, {
                    opAttributes: result['op-attributes'],
                    opMeasurements: result['op-measurements'],
                });

                /* TODO: Should use an actual `device-id` for the chipId. The device-id mappings for graphs are available in
                 *   `perf_results/perf_info_all_epochs.csv`.
                 *
                 * The node ID keys in the perf analyzer results file don't have the chip ID (device ID) component.
                 * We're forcing chip ID to 0 here, since for now we're only dealing with single-graph temporal epochs.
                 */
                return Object.entries(result['core-measurements']).map(([chipId, corePerfJson]) => [
                    `0-${chipId}`,
                    corePerfJson,
                ]);
            })
            .flat(),
    );

    // TODO: opAttributesMeasurements needs to be propagated to the data model

    chip = Chip.AUGMENT_WITH_PERF_ANALYZER_RESULTS(chip, analyzerResultsJsonWithChipIds);
    return chip;
};

/** Implements a temporary wrapper around the Folder Loading component & Graph selection component, to provide state
 * and context that is not yet present in the App's higher-level components.
 *
 * TODO: We want the folder and graph selection state values to persist after the graph is loaded, so that we
 *   a) know what graph is loaded, and
 *   b) can change to loading/viewing a different graph without loading the folder again
 *
 * TODO: Decouple graph selection from folder selection
 * */
export const TempFolderLoadingContext = ({ onDataLoad }: { onDataLoad: (data: Chip) => void }): React.ReactElement => {
    const selectedFolder = useSelector(getFilePathSelector);
    const selectedGraph = useSelector(getFileNameSelector);
    const selectedArchitecture = useSelector(getArchitectureSelector);

    const dispatch = useDispatch();

    const [graphOptions, setGraphOptions] = React.useState<string[]>([]);
    const [showGraphSelect, setShowGraphSelect] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [manualArchitectureSelection, setManualArchitectureSelection] = React.useState(false);

    const loadFolder = async (folderPath: string) => {
        dispatch(setSelectedFolder(folderPath));
        setManualArchitectureSelection(false);

        let metadata;
        try {
            metadata = await loadJsonFile(path.join(folderPath, 'metadata.json'));
            handleSelectArchitecture(metadata.architecture as Architecture);
        } catch (err) {
            console.warn('Failed to read metadata from folder:', err);
            setManualArchitectureSelection(true);
        }

        let graphs;
        try {
            graphs = await getAvailableGraphNames(folderPath);
        } catch (err) {
            console.error('Failed to read graph names from folder:', err);
            setError(err ? err.toString() : 'Unknown Error');
            return;
        }
        setGraphOptions(graphs);
        setShowGraphSelect(true);
    };

    const handleSelectArchitecture = (arch: Architecture) => {
        dispatch(setSelectedArchitecture(arch));
    };

    const onSelectGraphName = (graphName: string) => {
        dispatch(setSelectedFileName(graphName));
        if (selectedFolder) {
            loadGraph(selectedFolder, graphName, selectedArchitecture)
                .then((chip) => {
                    setShowGraphSelect(false);
                    onDataLoad(chip);
                    return null;
                })
                .catch((err) => {
                    console.error(err);
                    setError(err);
                });
        } else {
            console.error('Attempted to load graph but no folder path was available');
        }
    };

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
                options={graphOptions}
                selectedItem={selectedGraph}
                onSelectItem={onSelectGraphName}
                disabled={!showGraphSelect || !selectedArchitecture}
            />

            {/* For Debugging */}
            {selectedFolder && <p>Selected Folder: {selectedFolder}</p>}
            {selectedGraph && <p>Selected Graph: {selectedGraph}</p>}
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
