// import yaml from 'js-yaml';
import {useDispatch} from 'react-redux';
import {parse} from 'yaml';
import fs from 'fs';
import {useNavigate} from 'react-router-dom';
import {FC, useContext} from 'react';
import {IconNames} from '@blueprintjs/icons';
import {Button} from '@blueprintjs/core';
import DataSource from '../../data/DataSource';
import SVGData, {SVGJson} from '../../data/DataStructures';
import yamlValidate from '../../data/DataUtils';
import {loadNodesData, loadPipeSelection} from '../../data/store';

interface FileLoaderProps {
    updateData: (data: SVGData) => void;
}

const FileLoader: FC<FileLoaderProps> = ({updateData}) => {
    const navigate = useNavigate();
    const {setSvgData} = useContext(DataSource);

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
                    const isValid = yamlValidate(doc);
                    if (isValid) {
                        const svgData = new SVGData(doc as SVGJson);
                        updateData(svgData);
                        dispatch(loadPipeSelection(svgData.getAllPipeIds()));
                        dispatch(loadNodesData(svgData.getAllNodes()));
                        navigate('/render');
                    } else {
                        const errors = yamlValidate.errors?.map((error) => {
                            return error.message;
                        });
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
            <Button icon={IconNames.UPLOAD} text="Load visualizer output yaml file" onClick={loadFile}/>
        </div>
    );
};

export default FileLoader;
