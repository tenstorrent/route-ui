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
import { GraphOnChipContext } from '../../data/GraphOnChipDataProvider';
import type { FolderLocationType } from '../../data/StateTypes';
import { setSelectedRemoteFolder } from '../../data/store/slices/uiState.slice';
import { checkLocalFolderExists } from '../../utils/FileLoaders';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import type { RemoteConnection, RemoteFolder } from '../hooks/useRemote.hook';
import useRemoteConnection from '../hooks/useRemote.hook';
import FolderPicker from './folder-picker/FolderPicker';
import RemoteFolderSelector from './folder-picker/RemoteFolderSelector';
import GraphSelector from './graph-selector/GraphSelector';

import './TopHeaderComponent.scss';

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
    const { getActiveGraphName, resetGraphOnChipState, getActiveGraphRelationship, getActiveGraphOnChip } = useContext(GraphOnChipContext);
    const { loadPerfAnalyzerFolder, openPerfAnalyzerFolderDialog } = usePerfAnalyzerFileLoader();
    const dispatch = useDispatch();

    const localFolderPath = useSelector(getFolderPathSelector);
    const folderLocationType = useSelector(getSelectedFolderLocationType);

    const remoteConnectionConfig = useRemoteConnection().persistentState;

    const { selectedConnection } = remoteConnectionConfig;
    const availableRemoteFolders = remoteConnectionConfig
        .getSavedRemoteFolders(selectedConnection)
        .filter((folder) => folder.lastSynced);
    const selectedRemoteFolder = useSelector(getSelectedRemoteFolder) ?? availableRemoteFolders[0];
    const selectedGraph = getActiveGraphName();
    const chipId = getActiveGraphOnChip()?.chipId;
    const architecture = getActiveGraphOnChip()?.architecture;
    const temporalEpoch = getActiveGraphRelationship()?.temporalEpoch;

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

        resetGraphOnChipState();

        if (checkLocalFolderExists(folderPath)) {
            await loadPerfAnalyzerFolder(folderPath, newFolderLocationType);
        }
    };

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
                        text={folderLocationType === 'local' ? getTestName(localFolderPath) : ''}
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

                {selectedGraph && chipId !== undefined && (
                    <>
                        <span>Chip:</span>
                        <span>{chipId}</span>
                    </>
                )}

                {selectedGraph && temporalEpoch !== undefined && (
                    <>
                        <span>Epoch:</span>
                        <span>{temporalEpoch}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default TopHeaderComponent;
