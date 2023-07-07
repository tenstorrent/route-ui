import React, {FC} from 'react';
import FileLoader from './components/FileLoader';
import SVGData from '../data/DataStructures';

interface SplashScreenProps {
    updateData: (data: SVGData) => void;
}

const SplashScreen: FC<SplashScreenProps> = ({updateData}) => {
    return (
        <div className="splash-screen">
            <FileLoader updateData={updateData} />
        </div>
    );
};

export default SplashScreen;
