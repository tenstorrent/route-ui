import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
    getArchitectureSelector,
    getDockOpenState,
    getFileNameSelector,
    getHighContrastState,
} from 'data/store/selectors/uiState.selectors';
import { setDockOpenState, setHighContrastState } from 'data/store/slices/uiState.slice';
import '../scss/TopHeaderComponent.scss';

const TopHeaderComponent: React.FC = () => {
    const dispatch = useDispatch();
    const isHighContrast = useSelector(getHighContrastState);
    const fileName = useSelector(getFileNameSelector);
    const isDockOpen = useSelector(getDockOpenState);

    const architecture = useSelector(getArchitectureSelector);

    return (
        <div className='top-header-component'>
            <Switch
                checked={isHighContrast}
                label='Enable high contrast'
                onChange={(event) => dispatch(setHighContrastState(event.currentTarget.checked))}
            />
            <div className='text-content'>
                {architecture ? ` Architecture: ${architecture}` : ''} | {fileName ? `Loaded ${fileName}` : ''}
            </div>
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
