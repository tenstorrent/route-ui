import { FC } from 'react';
import { useSelector } from 'react-redux';

import { PerfDataLoader } from './components/folder-picker/FolderPicker';
import useLogging from './hooks/useLogging.hook';
import LogsOutput from './components/LogsOutput';
import { getLogEntriesByType, getLogOutputEnabled } from '../data/store/selectors/logging.selector';
import { LogLevel } from '../data/Types';

import './scss/SplashScreen.scss';

const SplashScreen: FC = () => {
    const logging = useLogging();
    const errorLogs = useSelector(getLogEntriesByType(LogLevel.ERROR));
    const logOutputEnabled = useSelector(getLogOutputEnabled);

    return (
        <div className='splash-screen'>
            {/* <FileLoader /> */}
            <PerfDataLoader />
            <button type='button' onClick={() => logging.error(`Test ${Math.random()}`)}>
                Add log
            </button>
            {logOutputEnabled && errorLogs.length > 0 && (
                <div id='splash-debug-panel'>
                    <LogsOutput />
                </div>
            )}
        </div>
    );
};

export default SplashScreen;
