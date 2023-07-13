import React from 'react';
import {useSelector} from 'react-redux';
import path from 'path';
import {RootState} from '../data/store';

const TopHeaderComponent: React.FC = () => {
    const fileName = useSelector((state: RootState) => {
        return state.nodeSelection.filename;
    });

    return <div className="top-header-component">{fileName ? `Loaded ${path.basename(fileName[0])}` : ''}</div>;
};

export default TopHeaderComponent;
