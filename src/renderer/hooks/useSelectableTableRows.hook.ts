// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useDispatch, useSelector } from 'react-redux';
import { type Location, useLocation } from 'react-router-dom';
import { getSelectedNodeList } from '../../data/store/selectors/nodeSelection.selectors';
import { selectOperandList, updateNodeSelection } from '../../data/store/slices/nodeSelection.slice';
import { getSelectedState } from '../components/bottom-dock/SharedTable';
import type { OpTableFields } from '../components/bottom-dock/useOperationsTable.hooks';
import type { QueuesTableFields } from '../components/bottom-dock/useQueuesTable.hook';
import useSelectableGraphVertex from './useSelectableGraphVertex.hook';
import type { LocationState } from '../../data/StateTypes';

const useSelectedTableRows = () => {
    const location: Location<LocationState> = useLocation();
    const { epoch: temporalEpoch } = location.state;
    const dispatch = useDispatch();
    const { selected, disabledOperand } = useSelectableGraphVertex();

    const nodesSelectionState = useSelector(getSelectedNodeList(temporalEpoch));

    return {
        handleSelectAllCores: (rows: OpTableFields[], isSelected: boolean) => {
            // TODO: batch update
            rows.forEach((row) => {
                dispatch(updateNodeSelection({ temporalEpoch, id: row.core_id, selected: isSelected }));
            });
        },
        handleSelectAllOperands: (rows: (OpTableFields | QueuesTableFields)[], isSelected: boolean) => {
            const operandNames = [
                ...new Set(
                    rows.reduce<string[]>((namesList, row) => {
                        if (!disabledOperand(row.name)) {
                            namesList.push(row.name);
                        }

                        return namesList;
                    }, []),
                ),
            ];

            dispatch(selectOperandList({ operands: operandNames, selected: isSelected }));
        },
        handleSelectAllSlowestOperands: (rows: OpTableFields[], isSelected: boolean) => {
            const operandNames = [
                ...new Set(
                    rows.reduce<string[]>((namesList, row) => {
                        if (!disabledOperand(row.slowestOperandRef?.name ?? '')) {
                            namesList.push(row.slowestOperandRef?.name ?? '');
                        }

                        return namesList;
                    }, []),
                ),
            ];

            dispatch(selectOperandList({ operands: operandNames, selected: isSelected }));
        },
        getCoreSelectedState: getSelectedState<OpTableFields>(
            (row) => nodesSelectionState[row.core_id]?.selected ?? false,
        ),
        getOperandSelectedState: getSelectedState<OpTableFields | QueuesTableFields>(
            (row) => selected(row.name),
            (row) => !disabledOperand(row.name),
        ),
        getSlowestOperandSelectedState: getSelectedState<OpTableFields>(
            (row) => selected(row.slowestOperandRef?.name ?? ''),
            (row) => !disabledOperand(row.slowestOperandRef?.name ?? ''),
        ),
    };
};

export default useSelectedTableRows;
