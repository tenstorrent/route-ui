// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getSelectedNodeList } from '../../data/store/selectors/nodeSelection.selectors';
import { updateNodeSelection } from '../../data/store/slices/nodeSelection.slice';
import { getSelectedState, handleSelectAll } from '../components/bottom-dock/SharedTable';
import type { OpTableFields } from '../components/bottom-dock/useOperationsTable.hooks';
import type { QueuesTableFields } from '../components/bottom-dock/useQueuesTable.hook';
import useSelectableGraphVertex from './useSelectableGraphVertex.hook';

const useSelectedTableRows = () => {
    const dispatch = useDispatch();
    const graphName = useContext(GraphOnChipContext).getActiveGraphName();
    const { selected, selectOperand, disabledOperand } = useSelectableGraphVertex();

    const nodesSelectionState = useSelector(getSelectedNodeList(graphName));

    return {
        handleSelectAllCores: handleSelectAll<OpTableFields>((row, isSelected) =>
            dispatch(updateNodeSelection({ graphName, id: row.core_id, selected: isSelected })),
        ),
        handleSelectAllOperands: handleSelectAll<OpTableFields | QueuesTableFields>(
            (row, isSelected) => selectOperand(row.name, isSelected),
            (row) => !disabledOperand(row.name),
        ),
        handleSelectAllSlowestOperands: handleSelectAll<OpTableFields>(
            (row, isSelected) => selectOperand(row.slowestOperandRef?.name ?? '', isSelected),
            (row) => !disabledOperand(row.slowestOperandRef?.name ?? ''),
        ),
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
