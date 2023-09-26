import React, {FC} from 'react';
import FileLoader from './components/FileLoader';
import SVGData from '../data/DataStructures';
import TempFileLoader from './components/TempFileLoader';
import {TempFolderLoadingContext} from './components/FolderPicker';

interface SplashScreenProps {
    updateData: (data: SVGData) => void;
}

const SplashScreen: FC<SplashScreenProps> = ({updateData}) => {
    return (
        <div className="splash-screen">
            <FileLoader updateData={updateData} />
            {/*<TempFileLoader updateData={updateData} />*/}
            {process.env.NODE_ENV === 'development' && <TempFolderLoadingContext onDataLoad={updateData} />}
        </div>
    );
};

export default SplashScreen;
