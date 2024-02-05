import { useDispatch, useSelector } from 'react-redux';
import type { OpTableFields } from '../components/bottom-dock/useOperationsTable.hooks';
import type { QueuesTableFields } from '../components/bottom-dock/useQueuesTable.hook';
import { GraphVertexType } from '../../data/GraphNames';
import { selectOperation, selectQueue, updateNodeSelection } from '../../data/store/slices/nodeSelection.slice';
import { RootState } from '../../data/store/createStore';
import { getSelectedState, handleSelectAll } from '../components/bottom-dock/SharedTable';

const useSelectedTableRows = () => {
    const dispatch = useDispatch();

    const getDisabledSlowestOperand = (row: OpTableFields) => {
        const name = row.slowestOperandRef?.name ?? '';
        const type = row.slowestOperandRef?.vertexType ?? GraphVertexType.OPERATION;

        if (type === GraphVertexType.OPERATION) {
            return operationsSelectionState[name]?.selected === undefined;
        }

        return queuesSelectionState[name]?.selected === undefined;
    };

    const operationsSelectionState = useSelector((state: RootState) => state.nodeSelection.operations);
    const queuesSelectionState = useSelector((state: RootState) => state.nodeSelection.queues);
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection.nodeList);

    return {
        handleSelectAllCores: handleSelectAll<OpTableFields>((row, selected) =>
            dispatch(updateNodeSelection({ id: row.core_id, selected })),
        ),
        handleSelectAllOperations: handleSelectAll<OpTableFields>((row, selected) =>
            dispatch(selectOperation({ opName: row.name, selected })),
        ),
        handleSelectAllSlowestOperands: handleSelectAll<OpTableFields>(
            (row, selected) => {
                const name = row.slowestOperandRef?.name ?? '';
                const type = row.slowestOperandRef?.vertexType ?? GraphVertexType.OPERATION;

                if (type === GraphVertexType.OPERATION) {
                    dispatch(selectOperation({ opName: name, selected }));
                } else {
                    dispatch(selectQueue({ queueName: name, selected }));
                }
            },
            (row) => !getDisabledSlowestOperand(row),
        ),
        handleSelectAllQueues: handleSelectAll<QueuesTableFields>((row, selected) => {
            dispatch(selectQueue({ queueName: row.name, selected }));
        }),
        getCoreSelectedState: getSelectedState<OpTableFields>(
            (row) => nodesSelectionState[row.core_id]?.selected ?? false,
        ),
        getOperationSelectedState: getSelectedState<OpTableFields>(
            (row) => operationsSelectionState[row.name]?.selected ?? false,
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
        ),
    };
};

export default useSelectedTableRows;
