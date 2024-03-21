import { Checkbox } from '@blueprintjs/core';
import { RootState } from 'data/store/createStore';
import { selectPipeSelectionById } from 'data/store/selectors/pipeSelection.selectors';
import { updateFocusPipe, updatePipeSelection } from 'data/store/slices/pipeSelection.slice';
import { ChangeEvent, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PipeSegment, convertBytes } from '../../data/GraphOnChip';
import getPipeColor from '../../data/ColorGenerator';
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
    const pipeState = useSelector((state: RootState) => selectPipeSelectionById(state, pipeSegment.id));
    const focusPipe = useSelector((state: RootState) => state.pipeSelection.focusPipe);
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updatePipeSelection({ id: pipeState.id, selected: e.target.checked }));
    };
    if (pipeState?.selected === undefined) {
        // console.log('something is missing here');
        // console.log(pipeState);
        // console.log(pipeSegment);
    }
    return (
        <>
            <Checkbox
                disabled={pipeState?.selected === undefined}
                checked={pipeState?.selected}
                onChange={handleCheckboxChange}
            />
            <PipeInfoDialog
                pipeId={pipeSegment.id}
                hide={focusPipe !== pipeSegment.id}
                contents={
                    <span
                        className='label'
                        onMouseOver={() => {
                            dispatch(updateFocusPipe(pipeSegment.id));
                        }}
                        onFocus={() => {
                            dispatch(updateFocusPipe(pipeSegment.id));
                        }}
                        onMouseOut={() => {
                            dispatch(updateFocusPipe(null));
                        }}
                        onBlur={() => {
                            dispatch(updateFocusPipe(null));
                        }}
                    >
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
                }
            />
        </>
    );
};
SelectablePipe.defaultProps = {
    showBandwidthUse: false,
    showBandwidth: true,
};
export default SelectablePipe;
