import { FC } from 'react';

import FileLoader from './components/file-loader/FileLoader';
import { TempFolderLoadingContext } from './components/folder-picker/FolderPicker';

const SplashScreen: FC = () => {
    return (
        <div className='splash-screen'>
            <FileLoader />
            {/* <div> */}
            {/*    <TempFileLoader updateData={updateData} /> */}
            {/*    <Button icon={IconNames.APPLICATION} text='Render' onClick={() => navigate('/render')} /> */}
            {/* </div> */}
            {process.env.NODE_ENV === 'development' && <TempFolderLoadingContext />}
        </div>
    );
};

export default SplashScreen;
