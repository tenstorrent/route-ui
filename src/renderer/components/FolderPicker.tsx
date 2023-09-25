import React from 'react';

import {Button, MenuItem, Spinner} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {Popover2} from '@blueprintjs/popover2';
import {ItemRenderer, Select2} from '@blueprintjs/select';
import Chip from 'data/DataStructures';
import validateFolder from 'utils/Folder';

export const TempFolderLoadingContext = ({onDataLoad}: {onDataLoad: (data: Chip) => void}): React.ReactElement => {
    const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
    const [selectedGraph, setSelectedGraph] = React.useState<string | null>(null);

    return <FolderPicker onSelectFolder={setSelectedFolder} />;
};

interface FolderPickerProps {
    onSelectFolder: (folderPath: string) => void;
}

const FolderPicker = ({onSelectFolder}: FolderPickerProps): React.ReactElement => {
    const [isLoading, setIsLoading] = React.useState(false);
    const selectLocalFolder = async () => {
        const remote = await import('@electron/remote');
        const openDialogResult = await remote.dialog.showOpenDialog({
            properties: ['openDirectory'],
        });

        // if nothing was selected, return
        if (!openDialogResult) {
            return;
        }
        setIsLoading(true);
        const folderPath = String(openDialogResult);
        if (!validateFolder(folderPath)) {
            alert('Invalid folder selected.');
            setIsLoading(false);
            return;
        }
        onSelectFolder(folderPath);
    };
    return (
        <>
            {isLoading && <Spinner size={20} intent="primary" className={isLoading ? 'loading' : ''} />}
            <Popover2
                position="bottom"
                content={
                    <div>
                        <Button icon={IconNames.FOLDER_OPEN} text="Local" onClick={() => selectLocalFolder()} />
                        <Button icon={IconNames.CLOUD_DOWNLOAD} text="Remote" disabled />
                    </div>
                }
            >
                <Button icon={IconNames.GRAPH} text="Load Perf Analyzer Folder" />
            </Popover2>
        </>
    );
};

export default FolderPicker;
