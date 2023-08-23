// import yaml from 'js-yaml';
import {useDispatch} from 'react-redux';
import {parse} from 'yaml';
import fs from 'fs';
import {useNavigate} from 'react-router-dom';
import {FC, useContext} from 'react';
import {IconNames} from '@blueprintjs/icons';
import {Button} from '@blueprintjs/core';
import DataSource from '../../data/DataSource';
import SVGData, {ComputeNode} from '../../data/DataStructures';
import yamlValidate from '../../data/DataUtils';
import {closeDetailedView, loadedFilename, loadNodesData, loadPipeSelection, setArchitecture} from '../../data/store';
import {NOCLinkJson, SVGJson} from '../../data/JSONDataTypes';
import ChipDesign from '../../data/ChipDesign';

interface TempFileLoaderProps {
    updateData: (data: SVGData) => void;
}

/**
 * Temporary file loader for arch.yaml files
 * @param updateData
 * @constructor
 *
 * @description This component is used to test load arch.yaml files to see data compatibility and pave the way for the new arch.json format
 */
const TempFileLoader: FC<TempFileLoaderProps> = ({updateData}) => {
    const navigate = useNavigate();
    const {setSvgData} = useContext(DataSource);

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
                filelist.forEach((filename) => {
                    try {
                        let parsedFile;
                        let doc;
                        switch (filename.split('.').pop()) {
                            case 'yaml':
                                doc = parse(data);
                                console.log(doc);
                                parsedFile = doc;
                                // console.log(JSON.stringify(doc));
                                break;
                            case 'json':
                                console.log(data);
                                parsedFile = data;
                                // console.log(JSON.stringify(data));
                                break;
                            default:
                                console.log('unknown file type');
                        }
                        if (filename.includes('arch')) {
                            const obj = new ChipDesign(parsedFile);
                            console.log(obj);
                            const svgData = new SVGData();
                            svgData.nodes = obj.nodes.map((simpleNode, idx) => {
                                const nodeData = {
                                    location: [],
                                    type: simpleNode.type,
                                    id: '',
                                    noc: '',
                                    op_name: '',
                                    op_cycles: 0,

                                    links: {},
                                };
                                const n = new ComputeNode(nodeData, idx);
                                n.loc = simpleNode.loc;
                                return n;
                            });
                            svgData.totalRows = obj.totalRows;
                            svgData.totalCols = obj.totalCols;
                            updateData(svgData);
                            dispatch(loadNodesData(svgData.getAllNodes()));
                            navigate('/render');
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
            <Button icon={IconNames.UPLOAD} text="Load yaml or json file" onClick={loadFile} />
        </div>
    );
};

export default TempFileLoader;
