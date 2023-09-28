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
import Chip from '../../data/Chip';
import {
    closeDetailedView,
    loadedFilename,
    loadLinkData,
    loadNodesData,
    loadPipeSelection,
    setArchitecture,
    updateTotalOPs,
} from '../../data/store';
import {NetlistAnalyzerDataJSON} from '../../data/JSONDataTypes';
import {parseOpDataFormat} from '../../data/DataParsers';

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
                            // TODO: embed the json into codebase.
                            const chipDesign = Chip.CREATE_FROM_CHIP_DESIGN(parsedFile);

                            updateData(chipDesign);
                            dispatch(loadNodesData(chipDesign.getAllNodes()));
                            dispatch(setArchitecture(chipDesign.architecture));
                        }
                        if (filename.includes('analyzer_output_temporal_epoch')) {
                            const localGridData = Chip.CREATE_FROM_NETLIST_JSON(doc as NetlistAnalyzerDataJSON);
                            updateData(localGridData);
                            dispatch(closeDetailedView());
                            dispatch(setArchitecture(localGridData.architecture));
                            dispatch(loadedFilename(filename));
                            dispatch(loadPipeSelection(localGridData.getAllPipeIds()));
                            dispatch(loadNodesData(localGridData.getAllNodes()));
                            dispatch(loadLinkData(localGridData.getAllLinks()));
                            dispatch(updateTotalOPs(localGridData.totalOpCycles));
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
            <Button
                icon={IconNames.UPLOAD}
                text="Load yaml or json files one at a time, analyzer output first"
                onClick={loadFile}
            />
        </div>
    );
};

export default TempFileLoader;
