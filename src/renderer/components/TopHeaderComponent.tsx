import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import path from 'path';
import { Switch } from '@blueprintjs/core';
import { RootState, setHighContrastState } from '../../data/store';
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
        </div>
    );
};

export default TopHeaderComponent;
