import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch } from '@blueprintjs/core';
import {
    getArchitectureSelector,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
    getHighContrastState,
} from 'data/store/selectors/uiState.selectors';
import { setHighContrastState } from 'data/store/slices/uiState.slice';
import '../scss/TopHeaderComponent.scss';
import GraphSelector from './graph-selector/GraphSelector';

const TopHeaderComponent: React.FC = () => {
    const dispatch = useDispatch();
    const isHighContrast = useSelector(getHighContrastState);
    const architecture = useSelector(getArchitectureSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);
    const folderPath = useSelector(getFolderPathSelector);

    const selectedGraphItem = availableGraphs.find((graph) => graph.name === selectedGraph);
    const selectedGraphInfo = `${selectedGraph}  Chip: ${selectedGraphItem?.chipId} Epoch: ${selectedGraphItem?.temporalEpoch}`;

    return (
        <div className='top-header-component'>
            <Switch
                checked={isHighContrast}
                label='Enable high contrast'
                onChange={(event) => dispatch(setHighContrastState(event.currentTarget.checked))}
            />

            <div className='text-content'>
                {architecture ? (
                    <span>
                        Architecture: <span className='architecture-label'>{architecture}</span>
                    </span>
                ) : (
                    ''
                )}
                <GraphSelector />
            </div>
            {folderPath && (
                <div className='text-content'>
                    <span>Selected Folder: </span>
                    <span className='path-label'>{folderPath}</span>
                    {/* this will need a better layout */}
                    {selectedGraph && (
                        <>
                            <span>Selected graph: </span>
                            <span className='path-label'>{selectedGraphInfo}</span>
                        </>
                    )}
                </div>
            )}

            {/* {process.env.NODE_ENV === 'development' && ( */}
            {/*     <Button */}
            {/*         icon={IconNames.APPLICATION} */}
            {/*         text='Dock' */}
            {/*         onClick={() => dispatch(setDockOpenState(!isDockOpen))} */}
            {/*     /> */}
            {/* )} */}
        </div>
    );
};

export default TopHeaderComponent;
