import { FC, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Slider } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import Collapsible from '../Collapsible';
import type { RootState } from '../../../data/store/createStore';
import { getOperationRatioThreshold } from '../../../data/store/selectors/operationPerf.selectors';
import { updateOperationRatioThreshold } from '../../../data/store/slices/operationPerf.slice';
import useOperationsTable, { type OpTableFields } from '../bottom-dock/useOperationsTable.hooks';
import { MAX_MODEL_RATIO_THRESHOLD, MIN_MODEL_RATIO_THRESHOLD } from '../../../data/constants';
import { ChipContext } from '../../../data/ChipDataProvider';

const ModelControls: FC = () => {
    const chip = useContext(ChipContext).getActiveChip();
    const dispatch = useDispatch();
    const opperationRatioThreshold = useSelector((state: RootState) => getOperationRatioThreshold(state));
    const { maxModelEstimateRatio } = useOperationsTable(
        [...(chip?.operations ?? [])].map((op) => {
            return {
                operation: op,
                name: op.name,
                ...op.details,
                slowestOperandRef: op.slowestOperand,
            } as unknown as OpTableFields;
        }),
    );

    const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    return (
        <Collapsible
            contentStyles={{
                display: 'flex',
                flexDirection: 'column',
            }}
            label={<Tooltip2 content='Model estimate difference with runtime'>Model Estimate Diff.</Tooltip2>}
            isOpen={false}
        >
            {/* <Slider */}
            {/*     min={MIN_MODEL_RATIO_THRESHOLD} */}
            {/*     max={maxModelEstimateRatio || MAX_MODEL_RATIO_THRESHOLD} */}
            {/*     labelStepSize={maxModelEstimateRatio > 5 ? Math.max(5, maxModelEstimateRatio / 5) : 1} */}
            {/*     stepSize={0.2} */}
            {/*     value={clampNumber(opperationRatioThreshold, MIN_MODEL_RATIO_THRESHOLD, maxModelEstimateRatio)} */}
            {/*     onChange={(value: number) => dispatch(updateOperationRatioThreshold(value))} */}
            {/*     labelRenderer={(value) => */}
            {/*         clampNumber(value, MIN_MODEL_RATIO_THRESHOLD, maxModelEstimateRatio).toFixed(1) */}
            {/*     } */}
            {/* /> */}
        </Collapsible>
    );
};

export default ModelControls;
