import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';
import {IconNames} from '@blueprintjs/icons';
import {Button} from '@blueprintjs/core';
import FileLoader from './components/FileLoader';
import Chip from '../data/DataStructures';
import TempFileLoader from './components/TempFileLoader';

interface SplashScreenProps {
    updateData: (data: Chip) => void;
}

const SplashScreen: FC<SplashScreenProps> = ({updateData}) => {

    return (
        <div className="splash-screen">
            <FileLoader updateData={updateData} />
            {/*<div>*/}
            {/*    <TempFileLoader updateData={updateData} />*/}
            {/*    <Button icon={IconNames.APPLICATION} text="Render" onClick={() => navigate('/render')} />*/}
            {/*</div>*/}
        </div>
    );
};

export default SplashScreen;
