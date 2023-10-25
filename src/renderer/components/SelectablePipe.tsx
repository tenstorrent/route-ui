import React, { ChangeEvent, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox } from '@blueprintjs/core';
import { RootState, selectPipeSelectionById, updateFocusPipe, updatePipeSelection } from '../../data/store';
import HighlightedText from './HighlightedText';
import { convertBytes, PipeSegment } from '../../data/Chip';
import getPipeColor from '../../data/ColorGenerator';
import ProgressBar from './ProgressBar';
import PipeInfoDialog from './PipeInfoDialog';

interface SelectablePipeProps {
    pipeSegment: PipeSegment;
    pipeFilter: string;
    showBandwidthUse?: boolean;
}

const SelectablePipe: FC<SelectablePipeProps> = ({ pipeSegment, pipeFilter, showBandwidthUse = false }) => {
    const dispatch = useDispatch();
    const pipeState = useSelector((state: RootState) => selectPipeSelectionById(state, pipeSegment.id));
    const focusPipe = useSelector((state: RootState) => state.pipeSelection.focusPipe);
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updatePipeSelection({ id: pipeState.id, selected: e.target.checked }));
    };
    return (
        <>
            <Checkbox checked={pipeState?.selected} onChange={handleCheckboxChange} />
            <PipeInfoDialog
                pipeId={pipeSegment.id}
                hide={focusPipe !== pipeSegment.id}
                contents={
                    <span className='label'
                          onMouseLeave={() => {
                              dispatch(updateFocusPipe(null));
                          }}
                          onMouseEnter={() => {
                              dispatch(updateFocusPipe(pipeSegment.id));
                          }}
                    >

                        {pipeState && (
                            <>
                                <HighlightedText text={pipeState.id} filter={pipeFilter} />{' '}
                                {pipeSegment.bandwidth !== null ? convertBytes(pipeSegment.bandwidth) : ''}
                                {showBandwidthUse && <span>{pipeSegment.bandwidthUse.toFixed(0)}%</span>}
                                <span
                                    className={`color-swatch ${pipeState?.selected ? '' : 'transparent'}`}
                                    style={{ backgroundColor: getPipeColor(pipeState.id) }}
                                />
                                <br />
                                {showBandwidthUse && pipeSegment.bandwidthUse !== null && (
                                    <ProgressBar percent={pipeSegment.bandwidthUse} />
                                )}
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
