import { useDispatch, useSelector } from 'react-redux';
import { selectOperation, selectQueue } from '../../data/store/slices/nodeSelection.slice';
import { RootState } from '../../data/store/createStore';

const useSelectableGraphVertex = () => {
    const dispatch = useDispatch();

    const operationsSelectionState = useSelector((state: RootState) => state.nodeSelection.operations);
    const queuesSelectionState = useSelector((state: RootState) => state.nodeSelection.queues);

    return {
        disabledQueue: (name: string) => queuesSelectionState[name]?.selected === undefined,
        disabledOperation: (name: string) => operationsSelectionState[name]?.selected === undefined,
        selected: (name: string) =>
            operationsSelectionState[name]?.selected ?? queuesSelectionState[name]?.selected ?? false,
        selectQueue: (queueName: string, selected: boolean) => dispatch(selectQueue({ queueName, selected })),
        selectOperation: (opName: string, selected: boolean) => dispatch(selectOperation({ opName, selected })),
    };
};

export default useSelectableGraphVertex;
