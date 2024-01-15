import { useDispatch, useSelector } from 'react-redux';
import { selectOperation, selectQueue } from '../../data/store/slices/nodeSelection.slice';
import { RootState } from '../../data/store/createStore';

type SelectableGraphVertexHook = {
    disabledQueue: (name: string) => boolean;
    disabledOperation: (name: string) => boolean;
    selected: (name: string) => boolean;
    selectQueue: (queueName: string, selected: boolean) => void;
    selectOperation: (opName: string, selected: boolean) => void;
};

const useSelectableGraphVertex = (): SelectableGraphVertexHook => {
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
    const groupsSelectionState = useSelector((state: RootState) => state.nodeSelection.operations);
    const queuesSelectionState = useSelector((state: RootState) => state.nodeSelection.queues);

    return {
        disabledQueue: (name: string) => {
            return queuesSelectionState[name]?.selected === undefined;
        },
        disabledOperation: (name: string) => {
            return groupsSelectionState[name]?.selected === undefined;
        },
        selected: (name: string) => {
            return groupsSelectionState[name]?.selected ?? queuesSelectionState[name]?.selected ?? false;
        },
        selectQueue: (queueName: string, selected: boolean) => {
            setQueueSelectionState(queueName, selected);
        },
        selectOperation: (opName: string, selected: boolean) => {
            setOperationSelectionState(opName, selected);
        },
    };
};

export default useSelectableGraphVertex;
