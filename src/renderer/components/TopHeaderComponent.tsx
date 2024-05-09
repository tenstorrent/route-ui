// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { sep as pathSeparator } from 'path';

import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import {
    getFolderPathSelector,
    getSelectedFolderLocationType,
    getSelectedRemoteFolder,
} from 'data/store/selectors/uiState.selectors';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnchorButton } from '@blueprintjs/core';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import type { FolderLocationType, LocationState } from '../../data/StateTypes';
import { setSelectedRemoteFolder } from '../../data/store/slices/uiState.slice';
import { checkLocalFolderExists } from '../../utils/FileLoaders';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import type { RemoteConnection, RemoteFolder } from '../hooks/useRemote.hook';
import useRemoteConnection from '../hooks/useRemote.hook';
import FolderPicker from './folder-picker/FolderPicker';
import RemoteFolderSelector from './folder-picker/RemoteFolderSelector';
import GraphSelector from './graph-selector/GraphSelector';

import './TopHeaderComponent.scss';
import { sendEventToMain } from '../utils/bridge';
import { ElectronEvents } from '../../main/ElectronEvents';

const getTestName = (path: string) => {
    const lastFolder = path.split(pathSeparator).pop();
    return lastFolder || 'n/a';
};

const formatRemoteFolderName = (connection?: RemoteConnection, folder?: RemoteFolder) => {
    if (!connection || !folder) {
        return 'n/a';
    }

    return `${connection.name} — ${folder.testName}`;
};

const TopHeaderComponent: React.FC = () => {
    const {
        resetGraphOnChipState,
        getActiveGraphOnChip,
        graphOnChipList,
        // TODO: move those calls to navigation
        selectPreviousGraph,
        selectNextGraph,
        getPreviousGraphName,
        getNextGraphName,
    } = useContext(GraphOnChipContext);
    const { loadPerfAnalyzerFolder, openPerfAnalyzerFolderDialog, loadPerfAnalyzerGraph, loadTemporalEpoch } =
        usePerfAnalyzerFileLoader();
    const dispatch = useDispatch();

    const localFolderPath = useSelector(getFolderPathSelector);
    const folderLocationType = useSelector(getSelectedFolderLocationType);

    const { persistentState: remoteConnectionConfig } = useRemoteConnection();

    const availableRemoteFolders = remoteConnectionConfig
        .getSavedRemoteFolders(remoteConnectionConfig.selectedConnection)
        .filter((folder) => folder.lastSynced);
    const selectedRemoteFolder = useSelector(getSelectedRemoteFolder) ?? availableRemoteFolders[0];
    const availableGraphs = Object.keys(graphOnChipList);
    const architecture = getActiveGraphOnChip()?.architecture;
    const location: Location<LocationState> = useLocation();
    const { chipId, epoch: temporalEpoch } = location.state;

    if (!chipId && !temporalEpoch && availableGraphs.length > 0) {
        loadPerfAnalyzerGraph(availableGraphs[0]);
    }

    const updateSelectedFolder = async (
        newFolder: RemoteFolder | string,
        newFolderLocationType: FolderLocationType,
    ) => {
        const folderPath = (newFolder as RemoteFolder)?.localPath ?? newFolder;

        if (typeof newFolder === 'string') {
            dispatch(setSelectedRemoteFolder(undefined));
        } else {
            dispatch(setSelectedRemoteFolder(newFolder));
        }

        // TODO: do we need this call?
        resetGraphOnChipState();

        if (checkLocalFolderExists(folderPath)) {
            await loadPerfAnalyzerFolder(folderPath, newFolderLocationType);

            if (newFolderLocationType === 'local') {
                sendEventToMain(ElectronEvents.UPDATE_WINDOW_TITLE, `(Local Folder) — ${getTestName(folderPath)}`);
            } else {
                sendEventToMain(
                    ElectronEvents.UPDATE_WINDOW_TITLE,
                    formatRemoteFolderName(remoteConnectionConfig.selectedConnection, newFolder as RemoteFolder),
                );
            }
        }
    };

    return (
        <div className='top-header-component'>
            <div className='text-content'>
                <Tooltip2
                    content={folderLocationType === 'local' ? 'Select remote folder' : undefined}
                    placement='bottom'
                >
                    <RemoteFolderSelector
                        remoteFolders={availableRemoteFolders}
                        remoteFolder={folderLocationType === 'remote' ? selectedRemoteFolder : undefined}
                        remoteConnection={remoteConnectionConfig.selectedConnection}
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
                        text={folderLocationType === 'local' ? getTestName(localFolderPath) : ''}
                    />
                </Tooltip2>
                <GraphSelector
                    onSelectGraph={(graphName) => loadPerfAnalyzerGraph(graphName)}
                    onSelectTemporalEpoch={(newTemporalEpoch) => loadTemporalEpoch(newTemporalEpoch)}
                />
                <Tooltip2
                    disabled={!getPreviousGraphName()}
                    content={`Back to graph: ${getPreviousGraphName()}`}
                    placement='bottom'
                >
                    <AnchorButton
                        minimal
                        disabled={!getPreviousGraphName()}
                        icon={IconNames.ARROW_LEFT}
                        onClick={() => selectPreviousGraph()}
                    />
                </Tooltip2>
                <Tooltip2
                    disabled={!getNextGraphName()}
                    content={`Forward to graph: ${getNextGraphName()}`}
                    placement='bottom'
                >
                    <AnchorButton
                        minimal
                        disabled={!getNextGraphName()}
                        icon={IconNames.ARROW_RIGHT}
                        onClick={() => selectNextGraph()}
                    />
                </Tooltip2>
            </div>

            <div className='text-content'>
                {architecture && (
                    <>
                        <span>Architecture:</span>
                        <span className='architecture-label'>{architecture}</span>
                    </>
                )}

                {chipId !== undefined && (
                    <>
                        <span>Chip:</span>
                        <span>{chipId}</span>
                    </>
                )}

                <span>Epoch:</span>
                <span>{temporalEpoch}</span>
            </div>
        </div>
    );
};

export default TopHeaderComponent;
