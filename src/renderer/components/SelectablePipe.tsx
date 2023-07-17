import React, {ChangeEvent, FC} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Checkbox} from '@blueprintjs/core';
import {RootState, selectPipeSelectionById, updatePipeSelection} from '../../data/store';
import HighlightedText from './HighlightedText';
import {convertBytes, Pipe} from '../../data/DataStructures';
import getPipeColor from '../../data/ColorGenerator';
import ProgressBar from './ProgressBar';

interface SelectablePipeProps {
    pipe: Pipe;
    pipeFilter: string;
    showBandwidthUse?: boolean;
}

const SelectablePipe: FC<SelectablePipeProps> = ({pipe, pipeFilter, showBandwidthUse = false}) => {
    const dispatch = useDispatch();
    const pipeState = useSelector((state: RootState) => selectPipeSelectionById(state, pipe.id));
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updatePipeSelection({id: pipeState.id, selected: e.target.checked}));
    };

    return (
        <>
            <Checkbox checked={pipeState.selected} onChange={handleCheckboxChange} />
            <span className="label">
                <HighlightedText text={pipeState.id} filter={pipeFilter} /> {convertBytes(pipe.bandwidth)}
                {showBandwidthUse && <span>{pipe.bandwidthUse.toFixed(0)}%</span>}
                <span className={`color-swatch ${pipeState.selected ? '' : 'transparent'}`} style={{backgroundColor: getPipeColor(pipeState.id)}} />
                <br />
                {showBandwidthUse && <ProgressBar percent={pipe.bandwidthUse} />}
            </span>
        </>
    );
};
SelectablePipe.defaultProps = {
    showBandwidthUse: false,
};
export default SelectablePipe;
