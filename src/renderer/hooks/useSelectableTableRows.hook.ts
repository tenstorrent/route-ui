// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getSelectedNodeList } from '../../data/store/selectors/nodeSelection.selectors';
import { selectOperandList, updateNodeSelection } from '../../data/store/slices/nodeSelection.slice';
import { getSelectedState } from '../components/bottom-dock/SharedTable';
import type { OpTableFields } from '../components/bottom-dock/useOperationsTable.hooks';
import type { QueuesTableFields } from '../components/bottom-dock/useQueuesTable.hook';
import useSelectableGraphVertex from './useSelectableGraphVertex.hook';

const useSelectedTableRows = () => {
    const dispatch = useDispatch();
    const graphName = useContext(GraphOnChipContext).getActiveGraphName();
    const { selected, disabledOperand } = useSelectableGraphVertex();

    const nodesSelectionState = useSelector(getSelectedNodeList(graphName));

    return {
        handleSelectAllCores: (rows: OpTableFields[], isSelected: boolean) => {
            rows.forEach((row) => {
                dispatch(updateNodeSelection({ graphName, id: row.core_id, selected: isSelected }));
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
