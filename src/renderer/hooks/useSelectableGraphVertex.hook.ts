// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getOperationsState, getQueuesState } from '../../data/store/selectors/nodeSelection.selectors';
import { selectOperation, selectQueue } from '../../data/store/slices/nodeSelection.slice';

const useSelectableGraphVertex = () => {
    const dispatch = useDispatch();
    const currentGraphName = useContext(GraphOnChipContext).getActiveGraphName();

    const operationsState = useSelector(getOperationsState);
    const queuesState = useSelector(getQueuesState);

    return {
        disabledQueue: (name: string, graphName?: string) =>
            queuesState[graphName ?? currentGraphName]?.[name]?.selected === undefined,
        disabledOperation: (name: string, graphName?: string) =>
            operationsState[graphName ?? currentGraphName]?.[name]?.selected === undefined,
        selected: (name: string, graphName?: string) =>
            operationsState[graphName ?? currentGraphName]?.[name]?.selected ??
            queuesState[graphName ?? currentGraphName]?.[name]?.selected ??
            false,
        selectQueue: (queueName: string, selected: boolean, graphName?: string) =>
            dispatch(selectQueue({ graphName: graphName ?? currentGraphName, queueName, selected })),
        selectOperation: (opName: string, selected: boolean, graphName?: string) =>
            dispatch(selectOperation({ graphName: graphName ?? currentGraphName, opName, selected })),
    };
};

export default useSelectableGraphVertex;
