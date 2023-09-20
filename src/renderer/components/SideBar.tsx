import {useNavigate} from 'react-router-dom';
import {Button} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {useDispatch} from 'react-redux';
import {Tooltip2} from '@blueprintjs/popover2';
import remote from '@electron/remote';
import fs from 'fs';
import path from 'path';
import {parse} from 'yaml';
import React, {useContext} from 'react';
import {
    closeDetailedView,
    LinkStateData,
    loadedFilename,
    loadIoDataIn,
    loadIoDataOut,
    loadLinkData,
    loadNodesData,
    loadPipeSelection,
    ComputeNodeState,
    PipeSelection,
    setArchitecture,
    updateTotalOPs,
} from '../../data/store';
import ChipDesign from '../../data/ChipDesign';
import Chip, {ComputeNode, ComputeNodeExtended, Pipe} from '../../data/DataStructures';
import {NetlistAnalyzerDataJSON} from '../../data/JSONDataTypes';
import ChipAugmentation from '../../data/ChipAugmentation';
import {parseOpDataFormat} from '../../data/DataParsers';
import DataSource from '../../data/DataSource';
import {MainRouteRendererProps} from '../MainRouteRenderer';

export interface SideBarProps {
    updateData: (data: Chip) => void;
}

export const SideBar: React.FC<SideBarProps> = ({updateData}) => {
    const navigate = useNavigate();

    const {chip} = useContext(DataSource);
    const dispatch = useDispatch();
    const reloadApp = () => {
        dispatch(loadedFilename(''));
        navigate('/');
    };

    const loadOpsToPipes = async () => {
        // eslint-disable-next-line global-require
        const remote = require('@electron/remote');
        const {dialog} = remote;

        await (async () => {
            const filelist: string[] = await dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{name: 'file', extensions: ['yaml', 'json']}],
            });

            if (!filelist) {
                return;
            }

            fs.readFile(String(filelist), 'utf-8', (err, data) => {
                if (err) {
                    console.error(err);
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
                                console.log('unknown file type');
                        }
                        if (filename.includes('op_to_pipe')) {
                            // const json = JSON.parse(parsedFile);
                            // console.log(parsedFile);
                            const chipAugmentation = new ChipAugmentation();
                            chipAugmentation.fromOpsJSON(parsedFile.ops);
                            if (chip) {
                                const augmentedData = new Chip();
                                Object.assign(augmentedData, chip);
                                augmentedData.operations = chipAugmentation.operations;
                                augmentedData.cores = chipAugmentation.cores;
                                augmentedData.pipesPerOp = chipAugmentation.pipesPerOp;
                                augmentedData.pipesPerOperand = chipAugmentation.pipesPerOperand;
                                augmentedData.pipesPerCore = chipAugmentation.pipesPerCore;
                                augmentedData.coreGroupsPerOperation = chipAugmentation.coreGroupsPerOperation;
                                augmentedData.coreGroupsPerOperand = chipAugmentation.coreGroupsPerOperand;
                                augmentedData.operationsByCore = chipAugmentation.operationsByCore;
                                augmentedData.operandsByCore = chipAugmentation.operandsByCore;

                                dispatch(loadIoDataIn(chipAugmentation.operandsByCoreInputs));
                                dispatch(loadIoDataOut(chipAugmentation.operandsByCoreOutputs));

                                updateData(augmentedData);
                            }
                        }
                        if (filename.includes('sample')) {
                            const json = JSON.parse(parsedFile);
                            // console.log(JSON.stringify(parseOpDataFormat(json)));
                        }
                    } catch (error) {
                        console.error(error);
                    }
                });
            });
        })();
    };
    return (
        <div className="sidebar">
            <Tooltip2 content="Load new netlist analyzer output .yaml file">
                <Button icon={IconNames.REFRESH} text="" onClick={reloadApp} />
            </Tooltip2>
            <Tooltip2 content="Load ops to pipes mapping">
                <Button icon={IconNames.IMPORT} text="" onClick={loadOpsToPipes} />
            </Tooltip2>
        </div>
    );
};
