import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import path from 'path';
import { Button, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { getDockOpenState, RootState, setHighContrastState, setDockOpenState } from '../../data/store';
import '../scss/TopHeaderComponent.scss';

const TopHeaderComponent: React.FC = () => {
    const dispatch = useDispatch();
    const isHighContrast = useSelector((state: RootState) => {
        return state.highContrast.enabled;
    });

    const fileName = useSelector((state: RootState) => {
        return state.nodeSelection.filename;
    });
    const architecture = useSelector((state: RootState) => {
        return state.nodeSelection.architecture;
    });

    const isDockOpen = useSelector((state: RootState) => getDockOpenState(state));

    return (
        <div className='top-header-component'>
            <Switch
                checked={isHighContrast}
                label='Enable high contrast'
                onChange={(event) => dispatch(setHighContrastState(event.currentTarget.checked))}
            />
            <div className='text-content'>
                {architecture ? ` Architecture: ${architecture}` : ''} |{' '}
                {fileName ? `Loaded ${path.basename(fileName[0])}` : ''}
            </div>
            <Button
                icon={IconNames.APPLICATION}
                text='Dock'
                onClick={() => dispatch(setDockOpenState(!isDockOpen))}
            />
        </div>
    );
};

export default TopHeaderComponent;
