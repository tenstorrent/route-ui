import React, {FC} from 'react';
import FileLoader from './components/FileLoader';
import Chip from '../data/Chip';
import TempFileLoader from './components/TempFileLoader';
import {TempFolderLoadingContext} from './components/FolderPicker';

interface SplashScreenProps {
    updateData: (data: Chip) => void;
}

const SplashScreen: FC<SplashScreenProps> = ({updateData}) => {
    return (
        <div className="splash-screen">
            <FileLoader updateData={updateData} />
            {/* <div> */}
            {/*    <TempFileLoader updateData={updateData} /> */}
            {/*    <Button icon={IconNames.APPLICATION} text="Render" onClick={() => navigate('/render')} /> */}
            {/* </div> */}
            {/* <TempFileLoader updateData={updateData} /> */}
            {process.env.NODE_ENV === 'development' && <TempFolderLoadingContext onDataLoad={updateData} />}
        </div>
    );
};

export default SplashScreen;
