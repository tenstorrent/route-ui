// import yaml from 'js-yaml';
import {useDispatch} from 'react-redux';
import {parse} from 'yaml';
import fs from 'fs';
import {useNavigate} from 'react-router-dom';
import {FC, useContext} from 'react';
import {IconNames} from '@blueprintjs/icons';
import {Button} from '@blueprintjs/core';
import path from 'path';
import DataSource from '../../data/DataSource';
import Chip, {ComputeNode, DramLink, DramName} from '../../data/DataStructures';
import yamlValidate from '../../data/DataUtils';
import {
    closeDetailedView,
    loadedFilename,
    loadIoData,
    loadIoDataIn,
    loadIoDataOut,
    loadLinkData,
    loadNodesData,
    loadPipeSelection,
    setArchitecture,
    updateTotalOPs
} from '../../data/store';
import {NOCLinkJSON, NetlistAnalyzerDataJSON} from '../../data/JSONDataTypes';
import ChipDesign from '../../data/ChipDesign';
import {parseOpDataFormat} from '../../data/DataParsers';
import ChipAugmentation from '../../data/ChipAugmentation';

interface TempFileLoaderProps {
    updateData: (data: Chip) => void;
}

/**
 * Temporary file loader for all files and filetypes
 * @param updateData
 * @constructor
 *
 */
const TempFileLoader: FC<TempFileLoaderProps> = ({updateData}) => {
    const navigate = useNavigate();
    const {chip, setChip} = useContext(DataSource);
    const dispatch = useDispatch();

    const loadFile = async () => {
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
                        if (filename.includes('arch')) {
                            const chipDesign = new ChipDesign(parsedFile);
                            // console.log(chipDesign);
                            const localGridData = new Chip();
                            localGridData.nodes = chipDesign.nodes.map((simpleNode) => {
                                const n = new ComputeNode(`0-${simpleNode.loc.x}-${simpleNode.loc.y}`);
                                n.type = simpleNode.type;
                                n.loc = simpleNode.loc;
                                n.dramChannel = simpleNode.dramChannel;
                                n.dramSubchannel = simpleNode.dramSubchannel;
                                return n;
                            });
                            localGridData.totalRows = chipDesign.totalRows;
                            localGridData.totalCols = chipDesign.totalCols;
                            updateData(localGridData);
                            dispatch(loadNodesData(localGridData.getAllNodes()));
                            dispatch(setArchitecture(chipDesign.architecture));
                            // navigate('/render');
                        }
                        if (filename.includes('analyzer_output_temporal_epoch')) {
                            const localGridData = new Chip();
                            // const start = performance.now();
                            localGridData.loadFromNetlistJSON(doc as NetlistAnalyzerDataJSON);
                            updateData(localGridData);
                            dispatch(closeDetailedView());
                            dispatch(setArchitecture(localGridData.architecture));
                            dispatch(loadedFilename(filename));
                            dispatch(loadPipeSelection(localGridData.getAllPipeIds()));
                            dispatch(loadNodesData(localGridData.getAllNodes()));
                            dispatch(loadLinkData(localGridData.getAllLinks()));
                            dispatch(updateTotalOPs(localGridData.totalOpCycles));
                        }
                        if (filename.includes('op_to_pipe')) {
                            // const json = JSON.parse(parsedFile);
                            console.log(parsedFile);
                            const chipAugmentation = new ChipAugmentation();
                            chipAugmentation.fromOpsJSON(parsedFile.ops);
                            if (chip) {
                                chip.operations = chipAugmentation.operations;
                                chip.cores = chipAugmentation.cores;
                                chip.pipesPerOp = chipAugmentation.pipesPerOp;
                                chip.pipesPerOperand = chipAugmentation.pipesPerOperand;
                                chip.pipesPerCore = chipAugmentation.pipesPerCore;
                                chip.coreGroupsPerOperation = chipAugmentation.coreGroupsPerOperation;
                                chip.coreGroupsPerOperand = chipAugmentation.coreGroupsPerOperand;
                                chip.operationsByCore = chipAugmentation.operationsByCore;
                                chip.operandsByCore = chipAugmentation.operandsByCore;

                                dispatch(loadIoDataIn(chipAugmentation.operandsByCoreInputs));
                                dispatch(loadIoDataOut(chipAugmentation.operandsByCoreOutputs));

                                console.log(chip.operations);
                                setChip(chip);
                            }
                            console.log(chipAugmentation);
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
        <div className="">
            <Button icon={IconNames.UPLOAD} text="Load yaml or json files one at a time, analyzer output first" onClick={loadFile} />
        </div>
    );
};

export default TempFileLoader;
