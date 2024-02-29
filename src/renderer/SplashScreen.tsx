import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { LogLevel } from '../data/Types';
import { getLogEntriesByType, getLogOutputEnabled } from '../data/store/selectors/logging.selector';
import LogsOutput from './components/LogsOutput';

import { toggleQueuesTable } from '../data/store/slices/experimentalFeatures.slice';
import { ElectronEvents } from '../main/ElectronEvents';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import RemoteConnectionOptions from './components/folder-picker/RemoteConnectionOptions';
import useAppConfig from './hooks/useAppConfig.hook';

import LocalFolderSelector from './components/folder-picker/LocalFolderSelector';
import './scss/FolderPicker.scss';
import './scss/SplashScreen.scss';

const SplashScreen: FC = () => {
    const errorLogs = useSelector(getLogEntriesByType(LogLevel.ERROR));
    const logOutputEnabled = useSelector(getLogOutputEnabled);

    const { getAppConfig } = useAppConfig();
    const dispatch = useDispatch();

    useEffect(() => {
        const isQueuesTableEnabled = JSON.parse(
            getAppConfig(ElectronEvents.TOGGLE_QUEUES_TABLE) ?? '[false]',
        )[0] as boolean;

        dispatch(toggleQueuesTable(isQueuesTableEnabled));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className='header'>
                <TenstorrentLogo />
            </div>
            <div className='splash-screen'>
                <div className='folder-picker-options'>
                    <fieldset>
                        <legend>Local folder</legend>
                        <Icon icon={IconNames.FOLDER_OPEN} size={150} />
                        <div className='folder-picker-wrapper'>
                            <LocalFolderSelector />
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Remote Sync</legend>
                        <Icon icon={IconNames.CLOUD} size={150} />
                        <div className='folder-picker-wrapper'>
                            <RemoteConnectionOptions />
                        </div>
                    </fieldset>
                </div>
                {logOutputEnabled && errorLogs.length > 0 && (
                    <div id='splash-debug-panel'>
                        <LogsOutput />
                    </div>
                )}
            </div>
        </>
    );
};

export default SplashScreen;
