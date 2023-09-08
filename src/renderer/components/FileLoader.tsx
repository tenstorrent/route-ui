// import yaml from 'js-yaml';
import {useDispatch} from 'react-redux';
import {parse} from 'yaml';
import fs from 'fs';
import {useNavigate} from 'react-router-dom';
import {FC, useContext} from 'react';
import {IconNames} from '@blueprintjs/icons';
import {Button} from '@blueprintjs/core';
import DataSource from '../../data/DataSource';
import GridData from '../../data/DataStructures';
import yamlValidate from '../../data/DataUtils';
import {closeDetailedView, loadedFilename, loadLinkData, loadNodesData, loadPipeSelection, setArchitecture, updateTotalOPs} from '../../data/store';
import {NetlistAnalyzerDataJSON} from '../../data/JSONDataTypes';

interface FileLoaderProps {
    updateData: (data: GridData) => void;
}

const FileLoader: FC<FileLoaderProps> = ({updateData}) => {
    const navigate = useNavigate();
    const {setGridData} = useContext(DataSource);

    const dispatch = useDispatch();

    const loadFile = async () => {
        // eslint-disable-next-line global-require
        const remote = require('@electron/remote');
        const {dialog} = remote;

        await (async () => {
            const filename = await dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{name: 'file', extensions: ['yaml']}],
            });

            if (!filename) {
                return;
            }

            fs.readFile(String(filename), 'utf-8', (err, data) => {
                if (err) {
                    console.error(err);
                    alert(`An error occurred reading the file: ${err.message}`);
                    return;
                }
                try {
                    const doc = parse(data);
                    // console.log(doc);
                    // console.log(JSON.stringify(doc));
                    /* TEMPORARY vallidation off */
                    const isValid = true; // yamlValidate(doc);
                    if (isValid) {
                        const gridData = new GridData();
                        gridData.loadFromNetlistJSON(doc as NetlistAnalyzerDataJSON);
                        updateData(gridData);
                        dispatch(closeDetailedView());
                        dispatch(setArchitecture(gridData.architecture));
                        dispatch(loadedFilename(filename));
                        dispatch(loadPipeSelection(gridData.getAllPipeIds()));
                        dispatch(loadNodesData(gridData.getAllNodes()));
                        dispatch(loadLinkData(gridData.getAllLinks()));
                        dispatch(updateTotalOPs(gridData.totalOpCycles));

                        navigate('/render');
                    } else {
                        const errors = yamlValidate.errors?.map((error) => {
                            return error.message;
                        });
                        console.error(errors);
                        console.error(errors?.join('\n'));
                        alert(`An error occurred parsing the file: ${errors?.join('\n')}`);
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        })();
    };

    return (
        <div className="">
            <Button icon={IconNames.UPLOAD} text="Load netlist analyzer output yaml file" onClick={loadFile} />
        </div>
    );
};

export default FileLoader;
