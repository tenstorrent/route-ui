import React from 'react';
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
import { setHighContrastState } from 'data/store/slices/uiState.slice';
import '../scss/TopHeaderComponent.scss';
import GraphSelector from './graph-selector/GraphSelector';

const formatFolderPath = (path: string) => {
    const lastFolder = path.split('/').pop();
    return `./${lastFolder ?? 'n/a'}`;
};

const TopHeaderComponent: React.FC = () => {
    const dispatch = useDispatch();
    const isHighContrast = useSelector(getHighContrastState);
    const architecture = useSelector(getArchitectureSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);
    const folderPath = useSelector(getFolderPathSelector);

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
                    <>
                        <span>Selected Folder: </span>
                        <Tooltip2 content={folderPath}>
                            {/* <Button icon={IconNames.FolderSharedOpen} text={formatFolderPath(folderPath)} /> */}
                            <span className='path-label'>{formatFolderPath(folderPath)}</span>
                        </Tooltip2>
                    </>
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
