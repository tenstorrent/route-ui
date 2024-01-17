// import yaml from 'js-yaml';
import { useDispatch } from 'react-redux';
import fs from 'fs';
import { useNavigate } from 'react-router-dom';
import { FC, useContext } from 'react';
import { IconNames } from '@blueprintjs/icons';
import { Button } from '@blueprintjs/core';
import DataSource from '../../data/DataSource';
import Chip from '../../data/Chip';
import useLogging from '../hooks/useLogging.hook';

interface OpsFileLoaderProps {
    updateData: (data: Chip) => void;
}

/**
 * Temporary file loader for arch.yaml files
 * @param updateData
 * @constructor
 *
 * @description This component is used to test load arch.yaml files to see data compatibility and pave the way for the new arch.json format
 * UPDATE: should be replaced with baked in json arch files
 *
 */
const OpsFileLoader: FC<OpsFileLoaderProps> = ({ updateData }) => {
    const logger = useLogging();
    const navigate = useNavigate();
    const { setChip } = useContext(DataSource);

    const dispatch = useDispatch();

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
                    logger.error(err.message);
                    alert(`An error occurred reading the file: ${err.message}`);
                    return;
                }
                filelist.forEach((filename) => {
                    try {
                        const json = JSON.parse(data);
                    } catch (error) {
                        logger.error((error as Error).message);
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
