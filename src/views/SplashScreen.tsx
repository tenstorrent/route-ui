// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC } from 'react';
import { useSelector } from 'react-redux';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { LogLevel } from '../data/Types';
import { getLogEntriesByType, getLogOutputEnabled } from '../data/store/selectors/logging.selector';
import LogsOutput from '../components/LogsOutput';

import TenstorrentLogo from '../assets/TenstorrentLogo';
import RemoteSyncConfigurator from '../components/folder-picker/RemoteSyncConfigurator';

import LocalFolderSelector from '../components/folder-picker/LocalFolderSelector';
import './SplashScreen.scss';

const SplashScreen: FC = () => {
    const errorLogs = useSelector(getLogEntriesByType(LogLevel.ERROR));
    const logOutputEnabled = useSelector(getLogOutputEnabled);

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
                            <RemoteSyncConfigurator />
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
