import { sep as pathSeparator } from 'path';

import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import {
    getArchitectureSelector,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
} from 'data/store/selectors/uiState.selectors';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useAppConfig from '../hooks/useAppConfig.hook';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import type { RemoteConnection, RemoteFolder } from '../hooks/useRemoteConnection.hook';
import useRemoteConnection from '../hooks/useRemoteConnection.hook';
import '../scss/TopHeaderComponent.scss';
import RemoteFolderSelector from './folder-picker/RemoteFolderSelector';
import GraphSelector from './graph-selector/GraphSelector';

const getTestName = (path: string) => {
    const lastFolder = path.split(pathSeparator).pop();
    return lastFolder ? `${pathSeparator}${lastFolder}` : 'n/a';
};

const TopHeaderComponent: React.FC = () => {
    const getSavedRemoteFolders = (connection?: RemoteConnection) => {
        return JSON.parse(getAppConfig(`${connection?.name}-remoteFolders`) ?? '[]') as RemoteFolder[];
    };

    const { loadPerfAnalyzerFolder, loadPerfAnalyzerGraph, resetAvailableGraphs, openPerfAnalyzerFolderDialog } =
        usePerfAnalyzerFileLoader();

    const architecture = useSelector(getArchitectureSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);

    const localFolderPath = useSelector(getFolderPathSelector);

    const { getAppConfig } = useAppConfig();
    const { checkLocalFolderExists } = useRemoteConnection();

    const savedConnections = JSON.parse(getAppConfig('remoteConnections') ?? '[]') as RemoteConnection[];
    const availableRemoteFolders = getSavedRemoteFolders(savedConnections[0]).filter((folder) => folder.lastSynced);
    const [selectedRemoteFolder, setSelectedFolder] = useState<RemoteFolder | undefined>(availableRemoteFolders[0]);

    const updateSelectedFolder = async (folder?: RemoteFolder | string) => {
        const folderPath = (folder as RemoteFolder)?.localPath ?? folder;

        if (typeof folder === 'string') {
            setSelectedFolder(undefined);
        } else {
            setSelectedFolder(folder);
        }

        if (checkLocalFolderExists(folderPath)) {
            await loadPerfAnalyzerFolder(folderPath);
        } else {
            resetAvailableGraphs();
        }
    };

    useEffect(() => {
        const hasAvailableGraphs = availableGraphs && availableGraphs.length > 0;

        if (hasAvailableGraphs) {
            loadPerfAnalyzerGraph(availableGraphs[0].name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableGraphs]);

    const selectedGraphItem = availableGraphs.find((graph) => graph.name === selectedGraph);

    return (
        <div className='top-header-component'>
            <div className='text-content'>
                <Tooltip2 content={localFolderPath} disabled={!selectedRemoteFolder}>
                    <RemoteFolderSelector
                        remoteFolders={availableRemoteFolders}
                        remoteFolder={selectedRemoteFolder}
                        falbackLabel=''
                        icon={IconNames.CLOUD_DOWNLOAD}
                        onSelectFolder={(folder) => {
                            updateSelectedFolder(folder);
                        }}
                    />
                </Tooltip2>
                <Tooltip2 content={localFolderPath} disabled={!!selectedRemoteFolder}>
                    <Button
                        icon={IconNames.FolderSharedOpen}
                        onClick={async () => {
                            const folderPath = await openPerfAnalyzerFolderDialog();

                            updateSelectedFolder(folderPath);
                        }}
                    >
                        {!selectedRemoteFolder && <span className='path-label'>{getTestName(localFolderPath)}</span>}
                    </Button>
                </Tooltip2>
                <GraphSelector />
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
