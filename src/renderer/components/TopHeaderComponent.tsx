import { sep as pathSeparator } from 'path';

import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import {
    getArchitectureSelector,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
    getSelectedFolderLocationType,
} from 'data/store/selectors/uiState.selectors';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { FolderLocationType } from '../../data/StateTypes';
import { checkLocalFolderExists } from '../../utils/FileLoaders';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import type { RemoteConnection, RemoteFolder } from '../hooks/useRemote.hook';
import useRemoteConnection from '../hooks/useRemote.hook';
import '../scss/TopHeaderComponent.scss';
import FolderPicker from './folder-picker/FolderPicker';
import RemoteFolderSelector from './folder-picker/RemoteFolderSelector';
import GraphSelector from './graph-selector/GraphSelector';

const getTestName = (path: string) => {
    const lastFolder = path.split(pathSeparator).pop();
    return lastFolder ? `${pathSeparator}${lastFolder}` : 'n/a';
};

const formatRemoteFolderName = (connection?: RemoteConnection, folder?: RemoteFolder) => {
    if (!connection || !folder) {
        return 'n/a';
    }

    return `${connection.name} - ${folder.testName}`;
};

const TopHeaderComponent: React.FC = () => {
    const { loadPerfAnalyzerFolder, resetAvailableGraphs, openPerfAnalyzerFolderDialog } = usePerfAnalyzerFileLoader();

    const architecture = useSelector(getArchitectureSelector);

    const localFolderPath = useSelector(getFolderPathSelector);
    const folderLocationType = useSelector(getSelectedFolderLocationType);

    const remoteConnectionConfig = useRemoteConnection().persistentState;

    const { selectedConnection } = remoteConnectionConfig;
    const availableRemoteFolders = remoteConnectionConfig
        .getSavedRemoteFolders(selectedConnection)
        .filter((folder) => folder.lastSynced);
    const [selectedRemoteFolder, setSelectedRemoteFolder] = useState<RemoteFolder | undefined>(
        availableRemoteFolders[0],
    );
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);

    const updateSelectedFolder = async (
        folder: RemoteFolder | string | undefined,
        newFolderLocationType: FolderLocationType,
    ) => {
        const folderPath = (folder as RemoteFolder)?.localPath ?? folder;

        if (typeof folder === 'string') {
            setSelectedRemoteFolder(undefined);
        } else {
            setSelectedRemoteFolder(folder);
        }

        if (checkLocalFolderExists(folderPath)) {
            resetAvailableGraphs();
            await loadPerfAnalyzerFolder(folderPath, newFolderLocationType);
        }
    };

    const selectedGraphItem = availableGraphs.find((graph) => graph.name === selectedGraph);

    return (
        <div className='top-header-component'>
            <div className='text-content'>
                <Tooltip2
                    content={
                        folderLocationType === 'local'
                            ? 'Select remote folder'
                            : formatRemoteFolderName(selectedConnection, selectedRemoteFolder)
                    }
                    placement='bottom'
                >
                    <RemoteFolderSelector
                        remoteFolders={availableRemoteFolders}
                        remoteFolder={folderLocationType === 'remote' ? selectedRemoteFolder : undefined}
                        falbackLabel=''
                        icon={IconNames.CLOUD_DOWNLOAD}
                        onSelectFolder={async (folder) => {
                            await updateSelectedFolder(folder, 'remote');
                        }}
                    />
                </Tooltip2>
                <Tooltip2
                    content={folderLocationType === 'remote' ? 'Select local folder' : localFolderPath}
                    placement='bottom'
                >
                    <FolderPicker
                        icon={IconNames.FolderSharedOpen}
                        onSelectFolder={async () => {
                            const folderPath = await openPerfAnalyzerFolderDialog();

                            if (folderPath) {
                                await updateSelectedFolder(folderPath, 'local');
                            }
                        }}
                        text={
                            folderLocationType === 'local' ? (
                                <span className='path-label'>{getTestName(localFolderPath)}</span>
                            ) : undefined
                        }
                    />
                </Tooltip2>
                <GraphSelector autoLoadFistGraph />
            </div>

            <div className='text-content'>
                {selectedGraph && architecture && (
                    <>
                        <span>Architecture:</span>
                        <span className='architecture-label'>{architecture}</span>
                    </>
                )}

                {selectedGraph && selectedGraphItem?.chipId !== undefined && (
                    <>
                        <span>Chip:</span>
                        <span>{selectedGraphItem?.chipId}</span>
                    </>
                )}

                {selectedGraph && selectedGraphItem?.temporalEpoch !== undefined && (
                    <>
                        <span>Epoch:</span>
                        <span>{selectedGraphItem?.temporalEpoch}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default TopHeaderComponent;
