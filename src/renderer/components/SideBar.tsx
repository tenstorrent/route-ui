import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ApplicationMode, Architecture } from 'data/Types';
import {
    clearAvailableGraphs,
    setDockOpenState,
    setSelectedArchitecture,
    setSelectedFile,
    setSelectedFolder,
} from 'data/store/slices/uiState.slice';
import fs from 'fs';
import path from 'path';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { parse } from 'yaml';

import { getApplicationMode, getDockOpenState } from 'data/store/selectors/uiState.selectors';
import Chip from '../../data/Chip';
import DataSource from '../../data/DataSource';
import useLogging from '../hooks/useLogging.hook';

export interface SideBarProps {
    updateData: (data: Chip) => void;
}

export const SideBar: React.FC<SideBarProps> = ({ updateData }) => {
    const logging = useLogging();
    const navigate = useNavigate();
    const applicationMode = useSelector(getApplicationMode);
    const { chip } = useContext(DataSource);
    const dispatch = useDispatch();
    const reloadAppData = () => {
        dispatch(clearAvailableGraphs());
        dispatch(setSelectedFile(''));
        dispatch(setSelectedArchitecture(Architecture.NONE));
        dispatch(setSelectedFolder(''));
        navigate('/');
    };

    const isDockOpen = useSelector(getDockOpenState);

    const loadOpsToPipes = async () => {
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
                    logging.error(err.message);
                    alert(`An error occurred reading the file: ${err.message}`);
                    return;
                }
                filelist.forEach((filepath) => {
                    const filename = path.basename(filepath);
                    const ext = path.extname(filepath);
                    try {
                        let parsedFile;
                        let doc;
                        switch (ext) {
                            case '.yaml':
                                doc = parse(data);
                                // console.log(doc);
                                parsedFile = doc;
                                // console.log(JSON.stringify(doc));
                                break;
                            case '.json':
                                // console.log(data);
                                parsedFile = data;
                                // console.log(JSON.stringify(data));
                                break;
                            default:
                                logging.log('Unknown file type. The accepted formats are .yaml and .json.');
                        }
                        if (filename.includes('op_to_pipe')) {
                            if (chip) {
                                const chipAugmentation = Chip.AUGMENT_FROM_OPS_JSON(chip, parsedFile.ops);
                                updateData(chipAugmentation);
                            }

                            // const json = JSON.parse(parsedFile);
                            // console.log(parsedFile);

                            // TODO: keeping this for now, to remove later.
                            // dispatch(loadIoDataIn(chipAugmentation.operandsByCoreInputs));
                            // dispatch(loadIoDataOut(chipAugmentation.operandsByCoreOutputs));
                        }
                        if (filename.includes('sample')) {
                            const json = JSON.parse(parsedFile);
                            // console.log(JSON.stringify(parseOpDataFormat(json)));
                        }
                    } catch (error) {
                        logging.error((error as Error).message);
                    }
                });
            });
        })();
    };
    return (
        <div className='sidebar'>
            <Tooltip2 content='Load new dataset'>
                <Button icon={IconNames.Home} text='' onClick={reloadAppData} />
            </Tooltip2>
            {applicationMode === ApplicationMode.NETLIST_ANALYZER && (
                <Tooltip2 content='Load ops to pipes mapping'>
                    <Button icon={IconNames.SERIES_FILTERED} text='' onClick={loadOpsToPipes} />
                </Tooltip2>
            )}
            {applicationMode === ApplicationMode.PERF_ANALYZER && (
                <Tooltip2 content='Show/Hide table dock'>
                    <Button
                        icon={IconNames.APPLICATION}
                        text=''
                        onClick={() => dispatch(setDockOpenState(!isDockOpen))}
                    />
                </Tooltip2>
            )}
        </div>
    );
};
