/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { useDispatch, useSelector } from 'react-redux';
import { getSelectedOperationList, getSelectedQueueList } from '../../data/store/selectors/nodeSelection.selectors';
import { selectOperation, selectQueue } from '../../data/store/slices/nodeSelection.slice';

const useSelectableGraphVertex = () => {
    const dispatch = useDispatch();

    const operationsSelectionState = useSelector(getSelectedOperationList);
    const queuesSelectionState = useSelector(getSelectedQueueList);

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
