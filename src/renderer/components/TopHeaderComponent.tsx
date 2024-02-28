import { sep as pathSeparator } from 'path';

import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import {
    getArchitectureSelector,
    getFolderPathSelector,
    getSelectedFolderOrigin,
} from 'data/store/selectors/uiState.selectors';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { SelectedFolderOrigin } from '../../data/StateTypes';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import type { RemoteFolder } from '../hooks/useRemoteConnection.hook';
import useRemoteConnection from '../hooks/useRemoteConnection.hook';
import '../scss/TopHeaderComponent.scss';
import RemoteFolderSelector from './folder-picker/RemoteFolderSelector';
import GraphSelector from './graph-selector/GraphSelector';

const getTestName = (path: string) => {
    const lastFolder = path.split(pathSeparator).pop();
    return lastFolder ? `${pathSeparator}${lastFolder}` : 'n/a';
};

const TopHeaderComponent: React.FC = () => {
    const {
        loadPerfAnalyzerFolder,
        selectedGraph,
        availableGraphs,
        resetAvailableGraphs,
        openPerfAnalyzerFolderDialog,
    } = usePerfAnalyzerFileLoader();

    const architecture = useSelector(getArchitectureSelector);

    const localFolderPath = useSelector(getFolderPathSelector);
    const folderOrigin = useSelector(getSelectedFolderOrigin);

    const { checkLocalFolderExists, getSavedRemoteFolders, getSelectedConnection } = useRemoteConnection();

    const selectedConnection = getSelectedConnection();
    const availableRemoteFolders = getSavedRemoteFolders(selectedConnection).filter((folder) => folder.lastSynced);
    const [selectedRemoteFolder, setSelectedRemoteFolder] = useState<RemoteFolder | undefined>(
        availableRemoteFolders[0],
    );

    const updateSelectedFolder = async (
        folder: RemoteFolder | string | undefined,
        newFolderOrigin: SelectedFolderOrigin,
    ) => {
        const folderPath = (folder as RemoteFolder)?.localPath ?? folder;

        if (typeof folder === 'string') {
            setSelectedRemoteFolder(undefined);
        } else {
            setSelectedRemoteFolder(folder);
        }

        if (checkLocalFolderExists(folderPath)) {
            resetAvailableGraphs();
            await loadPerfAnalyzerFolder(folderPath, newFolderOrigin);
        }
    };

    const selectedGraphItem = availableGraphs.find((graph) => graph.name === selectedGraph);

    return (
        <div className='top-header-component'>
            <div className='text-content'>
                <Tooltip2 content={localFolderPath} disabled={folderOrigin === 'local'}>
                    <RemoteFolderSelector
                        remoteFolders={availableRemoteFolders}
                        remoteFolder={folderOrigin === 'remote' ? selectedRemoteFolder : undefined}
                        falbackLabel=''
                        icon={IconNames.CLOUD_DOWNLOAD}
                        onSelectFolder={async (folder) => {
                            await updateSelectedFolder(folder, 'remote');
                        }}
                    />
                </Tooltip2>
                <Tooltip2 content={localFolderPath} disabled={folderOrigin === 'remote'}>
                    <Button
                        icon={IconNames.FolderSharedOpen}
                        onClick={async () => {
                            const folderPath = await openPerfAnalyzerFolderDialog();

                            if (folderPath) {
                                await updateSelectedFolder(folderPath, 'local');
                            }
                        }}
                    >
                        {folderOrigin === 'local' && <span className='path-label'>{getTestName(localFolderPath)}</span>}
                    </Button>
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
