import {
    clearAvailableGraphs,
    setAvailableGraphs,
    setApplicationMode,
    setSelectedFile,
} from 'data/store/slices/uiState.slice';

import { ApplicationMode } from 'data/Types';
import Chip from 'data/Chip';
import { NetlistAnalyzerDataJSON } from 'data/JSONDataTypes';
import { dialog } from '@electron/remote';
import fs from 'node:fs/promises';
import { getAvailableNetlistFiles } from 'utils/FileLoaders';
import { parse } from 'yaml';
import path from 'path';
import { useDispatch } from 'react-redux';
import { sortNetlistAnalyzerFiles } from 'utils/FilenameSorters';
import usePopulateChipData from './usePopulateChipData.hooks';
import useLogging from './useLogging.hook';

type NetlistAnalyzerFileLoaderHook = {
    handleSelectNetlistFile: () => Promise<void>;
    loadNetlistFile: (filename: string) => Promise<void>;
};

/** @deprecated */

const useNetlistAnalyzerFileLoader = (): NetlistAnalyzerFileLoaderHook => {
    const dispatch = useDispatch();
    const { populateChipData } = usePopulateChipData();
    const logging = useLogging();

    const selectFileDialog = () => {
        try {
            const filelist = dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{ name: 'file', extensions: ['yaml'] }],
            });
            const filename = Array.isArray(filelist) ? filelist[0] : null;

            return filename;
        } catch (err) {
            const error = err as Error;
            logging.error(`An error occurred selecting the file: ${error.message}`);
            alert(`An error occurred selecting the file: ${error.message}`);
            return null;
        }
    };

    const loadNetlistFile = async (filename: string): Promise<void> => {
        try {
            const data = await fs.readFile(filename, 'utf-8');
            const doc = parse(data);
            const chip = Chip.CREATE_FROM_NETLIST_JSON(doc as NetlistAnalyzerDataJSON);
            populateChipData(chip);
            dispatch(setSelectedFile(filename));
        } catch (err) {
            const error = err as Error;
            logging.error(`An error occurred reading the file: ${error.message}`);
            alert(`An error occurred reading the file: ${error.message}`);
        }
    };

    /** @deprecated */
    const loadFileList = async (filename: string) => {
        dispatch(clearAvailableGraphs());
        throw new Error('not implemented');
    };

    const handleSelectNetlistFile = async (): Promise<void> => {
        const filename = selectFileDialog();
        if (filename) {
            dispatch(setApplicationMode(ApplicationMode.NETLIST_ANALYZER));
            await loadFileList(filename);
            await loadNetlistFile(filename);
        }
    };

    return { handleSelectNetlistFile, loadNetlistFile };
};

export default useNetlistAnalyzerFileLoader;
