import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
    getArchitectureSelector,
    getDockOpenState,
    getFolderPathSelector,
    getHighContrastState,
} from 'data/store/selectors/uiState.selectors';
import { setDockOpenState, setHighContrastState } from 'data/store/slices/uiState.slice';
import '../scss/TopHeaderComponent.scss';
import GraphSelector from './graph-selector/GraphSelector';

const TopHeaderComponent: React.FC = () => {
    const dispatch = useDispatch();
    const isHighContrast = useSelector(getHighContrastState);
    const isDockOpen = useSelector(getDockOpenState);
    const architecture = useSelector(getArchitectureSelector);
    const folderPath = useSelector(getFolderPathSelector);

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
                </div>
            )}
            {process.env.NODE_ENV === 'development' && (
                <Button
                    icon={IconNames.APPLICATION}
                    text='Dock'
                    onClick={() => dispatch(setDockOpenState(!isDockOpen))}
                />
            )}
        </div>
    );
};

export default TopHeaderComponent;
