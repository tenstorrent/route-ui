import { FC } from 'react';
import { PerfDataLoader } from './components/folder-picker/FolderPicker';
import { sendEventToMain } from './utils/bridge';
import { ElectronEvents } from '../main/ElectronEvents';

const SplashScreen: FC = () => {
    sendEventToMain(ElectronEvents.ENABLE_LOGGING_MENU, false);

    return (
        <div className='splash-screen'>
            {/* <FileLoader /> */}
            <PerfDataLoader />
        </div>
    );
};

export default SplashScreen;
