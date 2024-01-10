import { useDispatch, useSelector } from 'react-redux';
import { selectGroup, selectQueue } from '../../data/store/slices/nodeSelection.slice';
import { RootState } from '../../data/store/createStore';

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
            selectGroup({
                opName,
                selected,
            }),
        );
    };
    const groupsSelectionState = useSelector((state: RootState) => state.nodeSelection.groups);
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
