// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

// import yaml from 'js-yaml';
import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import fs from 'fs';
import { FC } from 'react';
import useLogging from '../hooks/useLogging.hook';

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
        // eslint-disable-next-line global-require
        const remote = require('@electron/remote');
        const { dialog } = remote;

        await (async () => {
            const filelist: string[] = await dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{ name: 'file', extensions: ['yaml', 'json'] }],
            });

            if (!filelist) {
                return;
            }

            fs.readFile(String(filelist), 'utf-8', (err, data) => {
                if (err) {
                    logger.error(`An error occurred reading the file: ${err.message}`);
                    alert(`An error occurred reading the file: ${err.message}`);
                    return;
                }
                filelist.forEach((filename) => {
                    try {
                        const json = JSON.parse(data);
                    } catch (error) {
                        logger.error(`Error parsing JSON file: ${(error as Error).message}`);
                    }
                });
            });
        })();
    };

    return (
        <div className=''>
            <Button icon={IconNames.UPLOAD} text='Load OPs file' onClick={loadFile} />
        </div>
    );
};

export default OpsFileLoader;
