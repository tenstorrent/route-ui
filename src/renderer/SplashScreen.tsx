import { FC } from 'react';

import FileLoader from './components/FileLoader';
import { TempFolderLoadingContext } from './components/folder-picker/FolderPicker';

import usePopulateChipData from './hooks/usePopulateChipData.hooks';

const SplashScreen: FC = () => {
    const { populateChipData } = usePopulateChipData();

    return (
        <div className='splash-screen'>
            <FileLoader onChipLoaded={populateChipData} />
            {/* <div> */}
            {/*    <TempFileLoader updateData={updateData} /> */}
            {/*    <Button icon={IconNames.APPLICATION} text='Render' onClick={() => navigate('/render')} /> */}
            {/* </div> */}
            {process.env.NODE_ENV === 'development' && <TempFolderLoadingContext />}
        </div>
    );
};

export default SplashScreen;
