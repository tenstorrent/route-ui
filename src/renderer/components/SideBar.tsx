import {useNavigate} from 'react-router-dom';
import {Button} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {useDispatch} from 'react-redux';
import {Tooltip2} from '@blueprintjs/popover2';
import remote from '@electron/remote';
import fs from 'fs';
import path from 'path';
import {parse} from 'yaml';
import {useContext} from 'react';
import {closeDetailedView, loadedFilename, loadIoDataIn, loadIoDataOut, loadLinkData, loadNodesData, loadPipeSelection, setArchitecture, updateTotalOPs} from '../../data/store';
import ChipDesign from '../../data/ChipDesign';
import GridData, {ComputeNodeData} from '../../data/DataStructures';
import {NetlistAnalyzerDataJSON} from '../../data/JSONDataTypes';
import DataOps from '../../data/DataOps';
import {parseOpDataFormat} from '../../data/DataParsers';
import DataSource from '../../data/DataSource';

export default function SideBar() {
    const navigate = useNavigate();

    const {gridData, setGridData} = useContext(DataSource);
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
                            const dataOps = new DataOps();
                            dataOps.fromOpsJSON(parsedFile.ops);
                            if (gridData) {
                                gridData.operations = dataOps.operations;
                                gridData.cores = dataOps.cores;
                                gridData.pipesPerOp = dataOps.pipesPerOp;
                                gridData.pipesPerOperand = dataOps.pipesPerOperand;
                                gridData.pipesPerCore = dataOps.pipesPerCore;
                                gridData.coreGroupsPerOperation = dataOps.coreGroupsPerOperation;
                                gridData.coreGroupsPerOperand = dataOps.coreGroupsPerOperand;
                                gridData.operationsByCore = dataOps.operationsByCore;
                                gridData.operandsByCore = dataOps.operandsByCore;

                                dispatch(loadIoDataIn(dataOps.operandsByCoreInputs));
                                dispatch(loadIoDataOut(dataOps.operandsByCoreOutputs));

                                // console.log(gridData.operations);
                                setGridData(gridData);
                            }
                            console.log(dataOps);
                        }
                        if (filename.includes('sample')) {
                            const json = JSON.parse(parsedFile);
                            console.log(JSON.stringify(parseOpDataFormat(json)));
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
}
