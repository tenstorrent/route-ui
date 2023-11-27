import { FC } from 'react';

import FileLoader from './components/FileLoader';
import { TempFolderLoadingContext } from './components/folder-picker/FolderPicker';

import { useRenderChip } from './hooks/useRenderChip';

const SplashScreen: FC = () => {
    const { renderFromChip } = useRenderChip();

    return (
        <div className='splash-screen'>
            <FileLoader onChipLoaded={renderFromChip} />
            {/* <div> */}
            {/*    <TempFileLoader updateData={updateData} /> */}
            {/*    <Button icon={IconNames.APPLICATION} text='Render' onClick={() => navigate('/render')} /> */}
            {/* </div> */}
            {process.env.NODE_ENV === 'development' && <TempFolderLoadingContext />}
        </div>
    );
};

export default SplashScreen;
