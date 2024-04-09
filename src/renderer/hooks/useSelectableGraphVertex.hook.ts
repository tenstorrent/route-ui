// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getSelectedOperationList, getSelectedQueueList } from '../../data/store/selectors/nodeSelection.selectors';
import { selectOperation, selectQueue } from '../../data/store/slices/nodeSelection.slice';

const useSelectableGraphVertex = () => {
    const dispatch = useDispatch();
    const graphName = useContext(GraphOnChipContext).getActiveGraphName();

    const operationsSelectionState = useSelector(getSelectedOperationList);
    const queuesSelectionState = useSelector(getSelectedQueueList(graphName));

    return {
        disabledQueue: (name: string) => queuesSelectionState[name]?.selected === undefined,
        disabledOperation: (name: string) => operationsSelectionState[name]?.selected === undefined,
        selected: (name: string) =>
            operationsSelectionState[name]?.selected ?? queuesSelectionState[name]?.selected ?? false,
        selectQueue: (queueName: string, selected: boolean) =>
            dispatch(selectQueue({ graphName, queueName, selected })),
        selectOperation: (opName: string, selected: boolean) => dispatch(selectOperation({ opName, selected })),
    };
};

export default useSelectableGraphVertex;
