import { FC } from 'react';
import { useSelector } from 'react-redux';

import { PerfDataLoader } from './components/folder-picker/FolderPicker';
import LogsOutput from './components/LogsOutput';
import { getLogEntriesByType, getLogOutputEnabled } from '../data/store/selectors/logging.selector';
import { LogLevel } from '../data/Types';

import './scss/SplashScreen.scss';
import ClusterView from './components/cluster-view/ClusterView';

const SplashScreen: FC = () => {
    const errorLogs = useSelector(getLogEntriesByType(LogLevel.ERROR));
    const logOutputEnabled = useSelector(getLogOutputEnabled);

    return (
        <div className='splash-screen'>
            <PerfDataLoader />
            {logOutputEnabled && errorLogs.length > 0 && (
                <div id='splash-debug-panel'>
                    <LogsOutput />
                </div>
            )}
        </div>
    );
};

export default SplashScreen;
