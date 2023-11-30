import { Button } from '@blueprintjs/core';
import { FC } from 'react';
import { IconNames } from '@blueprintjs/icons';
import useNetlistAnalizerFileLoader from 'renderer/hooks/useNetlistAnalyzerFileLoader.hooks';

const FileLoader: FC = () => {
    const { handleSelectNetlistFile } = useNetlistAnalizerFileLoader();

    return (
        <div className=''>
            <Button
                icon={IconNames.UPLOAD}
                text='Load netlist analyzer output yaml file'
                onClick={handleSelectNetlistFile}
            />
        </div>
    );
};

export default FileLoader;
