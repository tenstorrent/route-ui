import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeDetailedView } from 'data/store/slices/detailedView.slice';
import { loadLinkData, updateTotalOPs } from 'data/store/slices/linkSaturation.slice';
import { setArchitecture, loadNodesData } from 'data/store/slices/nodeSelection.slice';
import { loadPipeSelection } from 'data/store/slices/pipeSelection.slice';

import FileLoader from './components/FileLoader';
import Chip from '../data/Chip';
import { TempFolderLoadingContext } from './components/FolderPicker';

import { mapIterable } from '../utils/IterableHelpers';

interface SplashScreenProps {
    updateChip: (data: Chip) => void;
}

const SplashScreen: FC<SplashScreenProps> = ({ updateChip }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const renderFromChip = (chip: Chip) => {
        updateChip(chip);
        dispatch(closeDetailedView());
        dispatch(setArchitecture(chip.architecture));
        dispatch(loadPipeSelection(chip.generateInitialPipesSelectionState()));
        dispatch(loadNodesData([...mapIterable(chip.nodes, (node) => node.generateInitialState())]));
        dispatch(loadLinkData(chip.getAllLinks().map((link) => link.generateInitialState())));
        dispatch(updateTotalOPs(chip.totalOpCycles));
        navigate('/render');
    };

    return (
        <div className='splash-screen'>
            <FileLoader onChipLoaded={renderFromChip} />
            {/*<div>*/}
            {/*    <TempFileLoader updateData={updateData} />*/}
            {/*    <Button icon={IconNames.APPLICATION} text='Render' onClick={() => navigate('/render')} />*/}
            {/*</div>*/}
            {process.env.NODE_ENV === 'development' && <TempFolderLoadingContext onDataLoad={renderFromChip} />}
        </div>
    );
};

export default SplashScreen;
