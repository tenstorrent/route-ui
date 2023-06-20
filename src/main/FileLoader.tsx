import yaml from 'js-yaml';
import fs from 'fs';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { DataSource } from '../data/DataSource';

export default function FileLoader() {
    const navigate = useNavigate();
    const { fileData, setFileData } = useContext(DataSource);

    const loadFile = () => {
        // eslint-disable-next-line global-require
        const remote = require('@electron/remote');
        const { dialog } = remote;


        const fileDialog = async (): Promise<void> => {
            let filename = await dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: { name: 'file', extensions: ['yaml'] },
            });

            // if nothing was selected, return
            if (!filename) {
                return;
            }

            filename = String(filename);
            fs.readFile(filename, 'utf-8', (err, data) => {
                if (err) {
                    alert(`An error occurred reading the file :${err.message}`);
                    return;
                }
                try {
                    const doc = yaml.load(data);
                    setFileData(doc);
                    navigate('/render');
                    //
                } catch (error) {
                    console.log(error);
                }
            });
            console.log(filename);
        };
        fileDialog();
    };
    return (
        <div className="">
            <button type="button" onClick={loadFile}>
                Load .yaml
            </button>
        </div>
    );
}
