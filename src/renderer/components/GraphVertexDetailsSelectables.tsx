import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Operand } from '../../data/Graph';
import { RootState } from '../../data/store/createStore';
import { selectGroup, selectQueue } from '../../data/store/slices/nodeSelection.slice';
import SelectableOperation from './SelectableOperation';
import { GraphVertexType } from '../../data/GraphNames';

const GraphVertexDetailsSelectables = (props: { operand: Operand }): React.ReactElement | null => {
    const { operand } = props;
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);
    const dispatch = useDispatch();
    const setOperationSelectionState = (opName: string, selected: boolean) =>
        dispatch(
            selectGroup({
                opName,
                selected,
            }),
        );

    const setQueueSelectionState = (queueName: string, selected: boolean) =>
        dispatch(
            selectQueue({
                queueName,
                selected,
            }),
        );
    return operand.vertexType === GraphVertexType.OPERATION ? (
        <SelectableOperation
            opName={operand.name}
            value={nodesSelectionState.groups[operand.name]?.selected}
            selectFunc={setOperationSelectionState}
            stringFilter=''
            type={operand.vertexType}
        />
    ) : (
        <SelectableOperation
            disabled={nodesSelectionState.queues[operand.name]?.selected === undefined}
            opName={operand.name}
            value={nodesSelectionState.queues[operand.name]?.selected}
            selectFunc={setQueueSelectionState}
            stringFilter=''
            type={operand.vertexType}
        />
    );
};

export default GraphVertexDetailsSelectables;
