import { sep as pathSeparator } from 'path';

import { FormGroup } from '@blueprintjs/core';
import type { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFolderPathSelector, getSelectedFolderLocationType } from '../../../data/store/selectors/uiState.selectors';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import GraphSelector from '../graph-selector/GraphSelector';
import FolderPicker from './FolderPicker';

const getTestName = (path: string) => {
    const lastFolder = path.split(pathSeparator).pop();
    return lastFolder ? `${pathSeparator}${lastFolder}` : '';
};

const LocalFolderOptions: FC = () => {
    const { loadPerfAnalyzerFolder, openPerfAnalyzerFolderDialog, error } = usePerfAnalyzerFileLoader();
    const localFolderPath = useSelector(getFolderPathSelector);
    const selectedFolderLocationType = useSelector(getSelectedFolderLocationType);
    return (
        <FormGroup
            label={<h3>Select local folder</h3>}
            labelFor='text-input'
            subLabel='Select local folder to load netlist analyzer output and performance data from'
        >
            <div className='buttons-container'>
                <FolderPicker
                    onSelectFolder={async () => {
                        const folderPath = await openPerfAnalyzerFolderDialog();

                        await loadPerfAnalyzerFolder(folderPath);
                    }}
                    text={selectedFolderLocationType === 'local' ? getTestName(localFolderPath) : undefined}
                />
                <GraphSelector disabled={selectedFolderLocationType === 'remote'} />
                {error && (
                    <div className='loading-error'>
                        <p>{error.toString()}</p>
                    </div>
                )}
            </div>
        </FormGroup>
    );
};

export default LocalFolderOptions;