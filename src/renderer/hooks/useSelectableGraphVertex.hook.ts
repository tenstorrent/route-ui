import { useDispatch, useSelector } from 'react-redux';
import { selectOperation, selectQueue, updateNodeSelection } from '../../data/store/slices/nodeSelection.slice';
import { RootState } from '../../data/store/createStore';
import { GraphVertexType } from '../../data/GraphNames';

const useSelectableGraphVertex = () => {
    const dispatch = useDispatch();
    const setQueueSelectionState = (queueName: string, selected: boolean) =>
        dispatch(
            selectQueue({
                queueName,
                selected,
            }),
        );
    const setOperationSelectionState = (opName: string, selected: boolean) => {
        dispatch(
            selectOperation({
                opName,
                selected,
            }),
        );
    };
    const setCoreSelectionState = (coreId: string, selected: boolean) => {
        dispatch(
            updateNodeSelection({
                id: coreId,
                selected,
            }),
        );
    };
    const operationsSelectionState = useSelector((state: RootState) => state.nodeSelection.operations);
    const queuesSelectionState = useSelector((state: RootState) => state.nodeSelection.queues);
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection.nodeList);

    return {
        disabledQueue: (name: string) => {
            return queuesSelectionState[name]?.selected === undefined;
        },
        disabledOperation: (name: string) => {
            return operationsSelectionState[name]?.selected === undefined;
        },
        disabledSlowestOperand: (name: string, type: GraphVertexType) => {
            if (type === GraphVertexType.OPERATION) {
                return operationsSelectionState[name]?.selected === undefined;
            }

            return queuesSelectionState[name]?.selected === undefined;
        },
        selected: (name: string) => {
            return operationsSelectionState[name]?.selected ?? queuesSelectionState[name]?.selected ?? false;
        },
        selectedOperation: (name: string) => {
            return operationsSelectionState[name]?.selected ?? false;
        },
        selectedQueue: (name: string) => {
            return queuesSelectionState[name]?.selected ?? false;
        },
        selectedNode: (id: string) => {
            return nodesSelectionState[id]?.selected ?? false;
        },
        selectedSlowestOperand: (name: string, type: GraphVertexType) => {
            if (type === GraphVertexType.OPERATION) {
                return operationsSelectionState[name]?.selected ?? false;
            }

            return queuesSelectionState[name]?.selected ?? false;
        },
        selectQueue: (queueName: string, selected: boolean) => {
            setQueueSelectionState(queueName, selected);
        },
        selectOperation: (opName: string, selected: boolean) => {
            setOperationSelectionState(opName, selected);
        },
        selectCore: (coreId: string, selected: boolean) => {
            setCoreSelectionState(coreId, selected);
        },
        selectSlowestOperand: (name: string, type: GraphVertexType, selected: boolean) => {
            if (type === GraphVertexType.OPERATION) {
                setOperationSelectionState(name, selected);
            } else {
                setQueueSelectionState(name, selected);
            }
        },
    };
};

export default useSelectableGraphVertex;
