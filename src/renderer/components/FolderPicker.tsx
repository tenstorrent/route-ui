import React from 'react';

import path from 'path';

import { Button, ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Classes, Popover2 } from '@blueprintjs/popover2';
import '../scss/FolderPicker.scss';

import { getAvailableGraphNames, loadJsonFile, readFile, validatePerfResultsFolder } from 'utils/Files';
import GraphPicker from './GraphPicker';
import Chip from '../../data/Chip';
import { Architecture } from '../../data/Types';
import { ChipDesignJSON } from '../../data/JSONDataTypes';
import { GraphDescriptorJSON } from "../../data/sources/GraphDescriptor";

const loadChipFromArchitecture = async (architecture: Architecture): Promise<Chip> => {
    if (architecture === Architecture.NONE) {
        throw new Error('No architecture provided.');
    }
    const remote = await import('@electron/remote');
    const architecturesPath = path.join(remote.app.getAppPath(), 'assets', 'architectures');
    const architectureFilename = {
        [Architecture.GRAYSKULL]: path.join(architecturesPath, 'arch-grayskull.json'),
        [Architecture.WORMHOLE]: path.join(architecturesPath, 'arch-wormhole.json'),
    }[architecture];
    const architectureJson = await loadJsonFile(architectureFilename);
    return Chip.CREATE_FROM_CHIP_DESIGN(architectureJson as ChipDesignJSON);
};

export const TempFolderLoadingContext = ({ onDataLoad }: { onDataLoad: (data: Chip) => void }): React.ReactElement => {
    const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
    const [selectedGraph, setSelectedGraph] = React.useState<string | null>(null);
    const [selectedArchitecture, setSelectedArchitecture] = React.useState<Architecture>(Architecture.NONE);
    const [graphOptions, setGraphOptions] = React.useState<string[]>([]);
    const [showGraphSelect, setShowGraphSelect] = React.useState(false);

    const loadFolder = async (folderPath: string) => {
        console.log(`Loading folder: ${folderPath}`);
        setSelectedFolder(folderPath);
        const graphs = await getAvailableGraphNames(folderPath);
        console.log(`Available graphs: ${graphs}`);
        setGraphOptions(graphs);
        setShowGraphSelect(true);
    };

    const loadGraph = async (folderPath: string, graphName: string, architecture: Architecture): Promise<Chip> => {
        const chip = await loadChipFromArchitecture(architecture);
        const graphPath = path.join(folderPath, 'graph_descriptor', graphName, 'cores_to_ops.json');
        const graphDescriptorJson = await loadJsonFile(graphPath);

        const newChip = Chip.AUGMENT_FROM_GRAPH_DESCRIPTOR(chip, graphDescriptorJson as GraphDescriptorJSON);

        // const analyzerResultsPath = path.join(folderPath, 'analyzer_results', graphName, 'graph_perf_report.json');
        // const analyzerResultsJson = await loadJsonFile(analyzerResultsPath)
        return newChip;
    };

    return (
        <div className='folder-load-container'>
            <Popover2
                content={
                    <GraphPicker
                        options={graphOptions}
                        selected={selectedGraph}
                        onSelect={(graphName) => {
                            setSelectedGraph(graphName);
                            setShowGraphSelect(false);
                            if (selectedFolder) {
                                loadGraph(selectedFolder, graphName, selectedArchitecture)
                                    .then((chip) => onDataLoad(chip))
                                    .catch((err) => console.log(err));
                            }
                        }}
                    />
                }
                disabled={!showGraphSelect}
                isOpen={showGraphSelect}
                placement='right'
            >
                <FolderPicker onSelectFolder={loadFolder} />
            </Popover2>
            <div>
                <ButtonGroup className='architecture-button-group'>
                    <Button
                        icon='person'
                        active={selectedArchitecture === Architecture.GRAYSKULL}
                        onClick={() => setSelectedArchitecture(Architecture.GRAYSKULL)}
                        className='architecture-button'
                    >
                        Grayskull
                    </Button>
                    <Button
                        icon='globe-network'
                        active={selectedArchitecture === Architecture.WORMHOLE}
                        onClick={() => setSelectedArchitecture(Architecture.WORMHOLE)}
                        className='architecture-button'
                    >
                        Wormhole
                    </Button>
                </ButtonGroup>
            </div>

            {/* Temporary elements to display success of selection */}
            {selectedArchitecture && <p>Selected Architecture: {selectedArchitecture}</p>}
            {selectedFolder && <p>Selected Folder: {selectedFolder}</p>}
            {selectedGraph && <p>Selected Graph: {selectedGraph}</p>}
        </div>
    );
};

interface FolderPickerProps {
    onSelectFolder: (folderPath: string) => void;
}

const FolderPicker = ({ onSelectFolder }: FolderPickerProps): React.ReactElement => {
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
                position='top'
                content={
                    <div className={Classes.POPOVER2_DISMISS}>
                        <Button icon={IconNames.FOLDER_OPEN} text='Local' onClick={() => selectLocalFolder()} />
                        <Button icon={IconNames.CLOUD_DOWNLOAD} text='Remote' disabled />
                    </div>
                }
            >
                <Button className='load-folder-button' icon={IconNames.GRAPH} text='Load Perf Analyzer Folder' />
            </Popover2>
        </div>
    );
};

export default FolderPicker;
