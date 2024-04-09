/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphVertexType } from '../../data/GraphNames';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import {
    getSelectedNodeList,
    getSelectedOperationList,
    getSelectedQueueList,
} from '../../data/store/selectors/nodeSelection.selectors';
import { selectOperation, selectQueue, updateNodeSelection } from '../../data/store/slices/nodeSelection.slice';
import { getSelectedState, handleSelectAll } from '../components/bottom-dock/SharedTable';
import type { OpTableFields } from '../components/bottom-dock/useOperationsTable.hooks';
import type { QueuesTableFields } from '../components/bottom-dock/useQueuesTable.hook';

const useSelectedTableRows = () => {
    const dispatch = useDispatch();
    const graphName = useContext(GraphOnChipContext).getActiveGraphName();

    const getDisabledOperation = (name: string) => {
        return operationsSelectionState[name]?.selected === undefined;
    };

    const getDisabledSlowestOperand = (row: OpTableFields) => {
        const name = row.slowestOperandRef?.name ?? '';
        const type = row.slowestOperandRef?.vertexType ?? GraphVertexType.OPERATION;

        if (type === GraphVertexType.OPERATION) {
            return operationsSelectionState[name]?.selected === undefined;
        }

        return queuesSelectionState[name]?.selected === undefined;
    };

    const getQueuesDisabledState = (name: string) => {
        return queuesSelectionState[name]?.selected === undefined;
    };

    const operationsSelectionState = useSelector(getSelectedOperationList);
    const queuesSelectionState = useSelector(getSelectedQueueList(graphName));
    const nodesSelectionState = useSelector(getSelectedNodeList);

    return {
        handleSelectAllCores: handleSelectAll<OpTableFields>((row, selected) =>
            dispatch(updateNodeSelection({ id: row.core_id, selected })),
        ),
        handleSelectAllOperations: handleSelectAll<OpTableFields>(
            (row, selected) => dispatch(selectOperation({ opName: row.name, selected })),
            (row) => !getDisabledOperation(row.name),
        ),
        handleSelectAllSlowestOperands: handleSelectAll<OpTableFields>(
            (row, selected) => {
                const name = row.slowestOperandRef?.name ?? '';
                const type = row.slowestOperandRef?.vertexType ?? GraphVertexType.OPERATION;

                if (type === GraphVertexType.OPERATION) {
                    dispatch(selectOperation({ opName: name, selected }));
                } else {
                    dispatch(selectQueue({ graphName, queueName: name, selected }));
                }
            },
            (row) => !getDisabledSlowestOperand(row),
        ),
        handleSelectAllQueues: handleSelectAll<QueuesTableFields>(
            (row, selected) => {
                dispatch(selectQueue({ graphName, queueName: row.name, selected }));
            },
            (row) => !getQueuesDisabledState(row.name),
        ),
        getCoreSelectedState: getSelectedState<OpTableFields>(
            (row) => nodesSelectionState[row.core_id]?.selected ?? false,
        ),
        getOperationSelectedState: getSelectedState<OpTableFields>(
            (row) => operationsSelectionState[row.name]?.selected ?? false,
            (row) => !getDisabledOperation(row.name),
        ),
        getSlowestOperandSelectedState: getSelectedState<OpTableFields>(
            (row) => {
                const name = row.slowestOperandRef?.name ?? '';
                const type = row.slowestOperandRef?.vertexType ?? GraphVertexType.OPERATION;

                if (type === GraphVertexType.OPERATION) {
                    return operationsSelectionState[name]?.selected ?? false;
                }

                return queuesSelectionState[name]?.selected ?? false;
            },
            (row) => !getDisabledSlowestOperand(row),
        ),
        getQueuesSelectedState: getSelectedState<QueuesTableFields>(
            (row) => queuesSelectionState[row.name]?.selected ?? false,
            (row) => !getQueuesDisabledState(row.name),
        ),
    };
};

export default useSelectedTableRows;
