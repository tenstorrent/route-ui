import React, {ChangeEvent, FC, useContext, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Checkbox, Dialog} from '@blueprintjs/core';
import {Tooltip2} from '@blueprintjs/popover2';
import {RootState, selectPipeSelectionById, updatePipeSelection} from '../../data/store';
import HighlightedText from './HighlightedText';
import {convertBytes, PipeData} from '../../data/DataStructures';
import getPipeColor from '../../data/ColorGenerator';
import ProgressBar from './ProgressBar';
import DataSource from '../../data/DataSource';
import {OperandData} from '../../data/DataOps';
import PipeInfoDialog from './PipeInfoDialog';

interface SelectablePipeProps {
    pipe: PipeData;
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
            <Checkbox checked={pipeState?.selected} onChange={handleCheckboxChange} />
            <PipeInfoDialog
                pipeId={pipe.id}
                contents={
                    <span className="label">
                        {pipeState && (
                            <>
                                <HighlightedText text={pipeState.id} filter={pipeFilter} /> {pipe.bandwidth !== null ? convertBytes(pipe.bandwidth) : ''}
                                {showBandwidthUse && <span>{pipe.bandwidthUse.toFixed(0)}%</span>}
                                <span className={`color-swatch ${pipeState?.selected ? '' : 'transparent'}`} style={{backgroundColor: getPipeColor(pipeState.id)}} />
                                <br />
                                {showBandwidthUse && pipe.bandwidthUse !== null && <ProgressBar percent={pipe.bandwidthUse} />}
                            </>
                        )}
                    </span>
                }
            />
        </>
    );
};
SelectablePipe.defaultProps = {
    showBandwidthUse: false,
};
export default SelectablePipe;
