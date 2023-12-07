import { FC } from 'react';

import FileLoader from './components/file-loader/FileLoader';
import { PerfDataLoader } from './components/folder-picker/FolderPicker';


const SplashScreen: FC = () => {
    return (
        <div className='splash-screen'>
            <FileLoader />
            <PerfDataLoader />
        </div>
    );
};

export default SplashScreen;
