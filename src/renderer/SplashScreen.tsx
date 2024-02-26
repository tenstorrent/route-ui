import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LogLevel } from '../data/Types';
import { getLogEntriesByType, getLogOutputEnabled } from '../data/store/selectors/logging.selector';
import LogsOutput from './components/LogsOutput';
import { PerfDataLoader } from './components/folder-picker/FolderPicker';

import { toggleQueuesTable } from '../data/store/slices/experimentalFeatures.slice';
import { ElectronEvents } from '../main/ElectronEvents';
import useAppConfig from './hooks/useAppConfig.hook';
import './scss/SplashScreen.scss';

const SplashScreen: FC = () => {
    const errorLogs = useSelector(getLogEntriesByType(LogLevel.ERROR));
    const logOutputEnabled = useSelector(getLogOutputEnabled);

    const { getAppConfig } = useAppConfig();
    const dispatch = useDispatch();

    const updateExperimentalFeaturesStateInRedux = () => {
        const isQueuesTableEnabled = JSON.parse(
            getAppConfig(ElectronEvents.TOGGLE_QUEUES_TABLE) ?? '[false]',
        )[0] as boolean;

        dispatch(toggleQueuesTable(isQueuesTableEnabled));
    };

    updateExperimentalFeaturesStateInRedux();

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
