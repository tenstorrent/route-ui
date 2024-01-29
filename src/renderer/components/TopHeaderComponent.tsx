import { sep as pathSeparator } from 'path';

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tooltip2 } from '@blueprintjs/popover2';
import { IconNames } from '@blueprintjs/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Switch } from '@blueprintjs/core';
import {
    getArchitectureSelector,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
    getHighContrastState,
} from 'data/store/selectors/uiState.selectors';
import { setHighContrastState, setSelectedGraphName } from 'data/store/slices/uiState.slice';
import '../scss/TopHeaderComponent.scss';
import GraphSelector from './graph-selector/GraphSelector';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';

const getTestName = (path: string) => {
    const lastFolder = path.split(pathSeparator).pop();
    return lastFolder ? `${pathSeparator}${lastFolder}` : 'n/a';
};

const TopHeaderComponent: React.FC = () => {
    const dispatch = useDispatch();
    const isHighContrast = useSelector(getHighContrastState);
    const architecture = useSelector(getArchitectureSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);
    const folderPath = useSelector(getFolderPathSelector);
    const { loadPerfAnalyzerFolder, loadPerfAnalyzerGraph } = usePerfAnalyzerFileLoader();
    const location = useLocation();

    useEffect(() => {
        const isSplashScreen = location.pathname === '/';

        const hasAvailableGraphs = availableGraphs && availableGraphs.length > 0;

        if (!isSplashScreen && hasAvailableGraphs) {
            dispatch(setSelectedGraphName(availableGraphs[0].name));

            loadPerfAnalyzerGraph(availableGraphs[0].name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableGraphs]);

    const selectedGraphItem = availableGraphs.find((graph) => graph.name === selectedGraph);

    return (
        <div className='top-header-component'>
            <Switch
                checked={isHighContrast}
                label='Enable high contrast'
                onChange={(event) => dispatch(setHighContrastState(event.currentTarget.checked))}
            />
            <div className='text-content'>
                {folderPath && (
                    <Tooltip2 content={folderPath}>
                        <Button icon={IconNames.FolderSharedOpen} onClick={loadPerfAnalyzerFolder}>
                            <span className='path-label'>{getTestName(folderPath)}</span>
                        </Button>
                    </Tooltip2>
                )}
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
