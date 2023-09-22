// import yaml from 'js-yaml';
import {useDispatch} from 'react-redux';
import {parse} from 'yaml';
import fs from 'fs';
import {useNavigate} from 'react-router-dom';
import {FC, useContext} from 'react';
import {IconNames} from '@blueprintjs/icons';
import {Button} from '@blueprintjs/core';
import DataSource from '../../data/DataSource';
import Chip from '../../data/DataStructures';
import yamlValidate from '../../data/DataUtils';
import {closeDetailedView, loadedFilename, loadLinkData, loadNodesData, loadPipeSelection, setArchitecture, updateTotalOPs} from '../../data/store';
import {NetlistAnalyzerDataJSON} from '../../data/JSONDataTypes';

interface FileLoaderProps {
    updateData: (data: Chip) => void;
}

const FileLoader: FC<FileLoaderProps> = ({updateData}) => {
    const navigate = useNavigate();
    const {setChip} = useContext(DataSource);

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
                        const chip = Chip.CREATE_FROM_NETLIST_JSON(doc as NetlistAnalyzerDataJSON);
                        updateData(chip);
                        dispatch(closeDetailedView());
                        dispatch(setArchitecture(chip.architecture));
                        dispatch(loadedFilename(filename));
                        dispatch(loadPipeSelection(chip.getAllPipeIds()));
                        dispatch(loadNodesData(chip.getAllNodes()));
                        dispatch(loadLinkData(chip.getAllLinks()));
                        dispatch(updateTotalOPs(chip.totalOpCycles));

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
