import React, {FC} from 'react';
import FileLoader from './components/FileLoader';
import Chip from '../data/Chip';

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
        </div>
    );
};

export default SplashScreen;
