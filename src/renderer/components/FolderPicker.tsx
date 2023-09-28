import React from 'react';

import {Button} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {Classes, Popover2} from '@blueprintjs/popover2';
import '../scss/FolderPicker.scss';

import {getAvailableGraphNames, validatePerfResultsFolder} from 'utils/Files';
import GraphPicker from './GraphPicker';
import Chip from '../../data/Chip';

export const TempFolderLoadingContext = ({onDataLoad}: {onDataLoad: (data: Chip) => void}): React.ReactElement => {
    const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
    const [selectedGraph, setSelectedGraph] = React.useState<string | null>(null);
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

    return (
        <div className="folder-load-container">
            <Popover2
                content={
                    <GraphPicker
                        options={graphOptions}
                        selected={selectedGraph}
                        onSelect={(graphName) => {
                            setSelectedGraph(graphName);
                            setShowGraphSelect(false);
                        }}
                    />
                }
                disabled={!showGraphSelect}
                isOpen={showGraphSelect}
                placement="right"
            >
                <FolderPicker onSelectFolder={loadFolder} />
            </Popover2>

            {/* Temporary elements to display success of selection */}
            {selectedFolder && <p>Selected Folder: {selectedFolder}</p>}
            {selectedGraph && <p>Selected Graph: {selectedGraph}</p>}
        </div>
    );
};

interface FolderPickerProps {
    onSelectFolder: (folderPath: string) => void;
}

const FolderPicker = ({onSelectFolder}: FolderPickerProps): React.ReactElement => {
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
        <div className="folder-picker">
            <Popover2
                position="top"
                content={
                    <div className={Classes.POPOVER2_DISMISS}>
                        <Button icon={IconNames.FOLDER_OPEN} text="Local" onClick={() => selectLocalFolder()} />
                        <Button icon={IconNames.CLOUD_DOWNLOAD} text="Remote" disabled />
                    </div>
                }
            >
                <Button className="load-folder-button" icon={IconNames.GRAPH} text="Load Perf Analyzer Folder" />
            </Popover2>
        </div>
    );
};

export default FolderPicker;
