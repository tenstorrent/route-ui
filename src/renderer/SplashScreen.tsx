import { FC } from 'react';
import { PerfDataLoader } from './components/folder-picker/FolderPicker';

const SplashScreen: FC = () => {
    return (
        <div className='splash-screen'>
            {/* <FileLoader /> */}
            <PerfDataLoader />
        </div>
    );
};

export default SplashScreen;
