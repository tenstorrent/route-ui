import { sep as pathSeparator } from 'path';

import { Button, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import {
    getArchitectureSelector,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
    getHighContrastState,
} from 'data/store/selectors/uiState.selectors';
import { setHighContrastState } from 'data/store/slices/uiState.slice';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import '../scss/TopHeaderComponent.scss';
import GraphSelector from './graph-selector/GraphSelector';

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
            <Switch
                checked={isHighContrast}
                label='Enable high contrast'
                onChange={(event) => dispatch(setHighContrastState(event.currentTarget.checked))}
            />
            <div className='text-content'>
                {folderPath && (
                    <Tooltip2 content={folderPath}>
                        <Button icon={IconNames.FolderSharedOpen} onClick={() => loadPerfAnalyzerFolder()}>
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
