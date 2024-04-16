// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Checkbox } from '@blueprintjs/core';
import { selectPipeSelectionById } from 'data/store/selectors/pipeSelection.selectors';
import { updateFocusPipe, updatePipeSelection } from 'data/store/slices/pipeSelection.slice';
import { ChangeEvent, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getPipeColor from '../../data/ColorGenerator';
import { PipeSegment, convertBytes } from '../../data/GraphOnChip';
import ColorSwatch from './ColorSwatch';
import HighlightedText from './HighlightedText';
import PipeInfoDialog from './PipeInfoDialog';
import ProgressBar from './ProgressBar';

interface SelectablePipeProps {
    pipeSegment: PipeSegment;
    pipeFilter: string;
    showBandwidth?: boolean;
    showBandwidthUse?: boolean;
}

const SelectablePipe: FC<SelectablePipeProps> = ({
    pipeSegment,
    pipeFilter,
    showBandwidth = true,
    showBandwidthUse = false,
}) => {
    const dispatch = useDispatch();
    const pipeState = useSelector(selectPipeSelectionById(pipeSegment.id));
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updatePipeSelection({ id: pipeState.id, selected: e.target.checked }));
    };
    return (
        <>
            <Checkbox
                disabled={pipeState?.selected === undefined}
                checked={pipeState?.selected}
                onChange={handleCheckboxChange}
            />
            <PipeInfoDialog
                pipeId={pipeSegment.id}
                onEnter={() => {
                    dispatch(updateFocusPipe(pipeSegment.id));
                }}
                onLeave={() => {
                    dispatch(updateFocusPipe(null));
                }}
            >
                <span className='label'>
                    {pipeState ? (
                        <>
                            <HighlightedText text={pipeState.id} filter={pipeFilter} />{' '}
                            {showBandwidth ? convertBytes(pipeSegment.bandwidth) : ''}
                            {showBandwidthUse && <span>{pipeSegment.bandwidthUse.toFixed(0)}%</span>}
                            <ColorSwatch isVisible={pipeState?.selected} color={getPipeColor(pipeState.id)} />
                            <br />
                            {showBandwidthUse && pipeSegment.bandwidthUse !== null && (
                                <ProgressBar percent={pipeSegment.bandwidthUse} />
                            )}
                        </>
                    ) : (
                        <HighlightedText text={pipeSegment.id} filter={pipeFilter} />
                    )}
                </span>
            </PipeInfoDialog>
        </>
    );
};
SelectablePipe.defaultProps = {
    showBandwidthUse: false,
    showBandwidth: true,
};
export default SelectablePipe;
