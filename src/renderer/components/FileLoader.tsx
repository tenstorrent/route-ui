// import yaml from 'js-yaml';
import { parse } from 'yaml';
import fs from 'fs';
import { FC } from 'react';
import { IconNames } from '@blueprintjs/icons';
import { Button } from '@blueprintjs/core';
import { useDispatch } from 'react-redux';
import { setSelectedFile } from 'data/store/slices/uiState.slice';

import Chip from '../../data/Chip';
import yamlValidate from '../../data/DataUtils';
import { NetlistAnalyzerDataJSON } from '../../data/JSONDataTypes';

interface FileLoaderProps {
    onChipLoaded: (data: Chip) => void;
}

const FileLoader: FC<FileLoaderProps> = ({ onChipLoaded }) => {
    const dispatch = useDispatch();

    const loadFile = async () => {
        // eslint-disable-next-line global-require
        const remote = require('@electron/remote');
        const { dialog } = remote;

        await (async () => {
            const filelist = await dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{ name: 'file', extensions: ['yaml'] }],
            });
            const filename = Array.isArray(filelist) ? filelist[0] : null;

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
                        onChipLoaded(chip);
                        dispatch(setSelectedFile(filename));
                    } else {
                        const errors = yamlValidate.errors?.map((error) => {
                            return error.message;
                        });
                        console.error(errors);
                        alert(`An error occurred parsing the file: ${errors?.join('\n')}`);
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        })();
    };

    return (
        <div className=''>
            <Button icon={IconNames.UPLOAD} text='Load netlist analyzer output yaml file' onClick={loadFile} />
        </div>
    );
};

export default FileLoader;
