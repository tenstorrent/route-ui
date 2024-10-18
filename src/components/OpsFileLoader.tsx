// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

// import yaml from 'js-yaml';
import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FC } from 'react';
import useLogging from '../hooks/useLogging.hook';
import { showFileDialog } from '../utils/bridge.js';

interface OpsFileLoaderProps {}

/**
 * Temporary file loader for arch.yaml files
 * @constructor
 *
 * @description This component is used to test load arch.yaml files to see data compatibility and pave the way for the new arch.json format
 * UPDATE: should be replaced with baked in json arch files
 *
 */
const OpsFileLoader: FC<OpsFileLoaderProps> = () => {
    const logger = useLogging();

    const loadFile = async () => {
        await (async () => {
            const filelist = await showFileDialog({
                properties: ['openFile'],
                filters: [{ name: 'file', extensions: ['yaml', 'json'] }],
            });

            if (!filelist || filelist?.length === 0) {
                return;
            }

            try {
                const data = await window.electron.fs.readFile(String(filelist[0]));

                try {
                    JSON.parse(data);
                } catch (error) {
                    logger.error(`Error parsing JSON file: ${(error as Error).message}`);
                }
            } catch (err) {
                logger.error(`An error occurred reading the file: ${(err as Error).message}`);
                // eslint-disable-next-line no-alert
                alert(`An error occurred reading the file: ${(err as Error).message}`);
                return;
            }

        })();
    };

    return (
        <div className=''>
            <Button icon={IconNames.UPLOAD} text='Load OPs file' onClick={loadFile} />
        </div>
    );
};

export default OpsFileLoader;
