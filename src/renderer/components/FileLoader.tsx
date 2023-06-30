// import yaml from 'js-yaml';
import { parse } from 'yaml';
import fs from 'fs';
import {useNavigate} from 'react-router-dom';
import {useContext} from 'react';
import {IconNames} from '@blueprintjs/icons';
import {Button} from '@blueprintjs/core';
import DataSource from '../../data/DataSource';
import SVGData, {SVGJson} from '../../data/DataStructures';
import yamlValidate from '../../data/DataUtils';

export default function FileLoader() {
    const navigate = useNavigate();
    const {setSvgData} = useContext(DataSource);

    const loadFile = async () => {
        // eslint-disable-next-line global-require
        const remote = require('@electron/remote');
        const {dialog} = remote;

        await (async () => {
            let filename = await dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{name: 'file', extensions: ['yaml']}],
            });

            if (!filename) {
                return;
            }

            filename = String(filename);
            fs.readFile(filename, 'utf-8', (err, data) => {
                if (err) {
                    console.error(err);
                    alert(`An error occurred reading the file: ${err.message}`);
                    return;
                }
                try {
                    const doc = parse(data);
                    const isValid = yamlValidate(doc);
                    if (isValid) {
                        setSvgData(new SVGData(doc as SVGJson));
                        navigate('/render');
                    } else {
                        console.error(yamlValidate.errors);
                        alert(`An error occurred parsing the file: ${yamlValidate.errors}`);
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        })();
    };

    return (
        <div className="">
            <Button icon={IconNames.UPLOAD} text="Load visualizer output yaml file" onClick={loadFile}/>
        </div>
    );
}
