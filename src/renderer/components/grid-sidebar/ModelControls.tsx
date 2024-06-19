// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Slider } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { FC, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { MAX_MODEL_RATIO_THRESHOLD, MIN_MODEL_RATIO_THRESHOLD } from '../../../data/constants';
import { getOperationRatioThreshold } from '../../../data/store/selectors/operationPerf.selectors';
import { updateOperationRatioThreshold } from '../../../data/store/slices/operationPerf.slice';
import Collapsible from '../Collapsible';
import useOperationsTable, { type OpTableFields } from '../bottom-dock/useOperationsTable.hooks';
import type { LocationState } from '../../../data/StateTypes';

const ModelControls: FC = () => {
    const location: Location<LocationState> = useLocation();
    const { epoch, chipId } = location.state;

    const graphOnChipList = useContext(GraphOnChipContext).getGraphOnChipListForTemporalEpoch(epoch, chipId);

    const dispatch = useDispatch();
    const opperationRatioThreshold = useSelector(getOperationRatioThreshold);
    const { getMaxModelEstimateRatio } = useOperationsTable();
    const maxModelEstimateRatio = useMemo(
        () =>
            getMaxModelEstimateRatio(
                graphOnChipList.flatMap(({ graphOnChip }) =>
                    [...graphOnChip.operations].map(
                        (op) =>
                            ({
                                operation: op,
                                name: op.name,
                                ...op.details,
                                slowestOperandRef: op.slowestOperand,
                            }) as unknown as OpTableFields,
                    ),
                ),
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [graphOnChipList],
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
            <Slider
                min={MIN_MODEL_RATIO_THRESHOLD}
                max={maxModelEstimateRatio || MAX_MODEL_RATIO_THRESHOLD}
                labelStepSize={maxModelEstimateRatio > 5 ? Math.max(5, maxModelEstimateRatio / 5) : 1}
                stepSize={0.2}
                value={clampNumber(opperationRatioThreshold, MIN_MODEL_RATIO_THRESHOLD, maxModelEstimateRatio)}
                onChange={(value: number) => dispatch(updateOperationRatioThreshold(value))}
                labelRenderer={(value) =>
                    clampNumber(value, MIN_MODEL_RATIO_THRESHOLD, maxModelEstimateRatio).toFixed(1)
                }
            />
        </Collapsible>
    );
};

export default ModelControls;
