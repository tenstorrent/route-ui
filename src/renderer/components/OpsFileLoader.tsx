// import yaml from 'js-yaml';
import {useDispatch} from 'react-redux';
import {parse} from 'yaml';
import fs from 'fs';
import {useNavigate} from 'react-router-dom';
import {FC, useContext} from 'react';
import {IconNames} from '@blueprintjs/icons';
import {Button} from '@blueprintjs/core';
import DataSource from '../../data/DataSource';
import Chip, {ComputeNode, DramLink} from '../../data/DataStructures';
import yamlValidate from '../../data/DataUtils';
import {closeDetailedView, loadedFilename, loadNodesData, loadPipeSelection, setArchitecture} from '../../data/store';
import {NOCLinkJSON, NetlistAnalyzerDataJSON} from '../../data/JSONDataTypes';
import ChipDesign from '../../data/ChipDesign';
import {parseOpDataFormat} from '../../data/DataParsers';
import {DramName} from '../../data/LinkName';

interface OpsFileLoaderProps {
    updateData: (data: Chip) => void;
}

/**
 * Temporary file loader for arch.yaml files
 * @param updateData
 * @constructor
 *
 * @description This component is used to test load arch.yaml files to see data compatibility and pave the way for the new arch.json format
 * UPDATE: should be replaced with baked in json arch files
 *
 */
const OpsFileLoader: FC<OpsFileLoaderProps> = ({updateData}) => {
    const navigate = useNavigate();
    const {setChip} = useContext(DataSource);

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
                        const json = JSON.parse(data);

                    } catch (error) {
                        console.error(error);
                    }
                });
            });
        })();
    };

    return (
        <div className="">
            <Button icon={IconNames.UPLOAD} text="Load OPs file" onClick={loadFile} />
        </div>
    );
};

export default OpsFileLoader;
