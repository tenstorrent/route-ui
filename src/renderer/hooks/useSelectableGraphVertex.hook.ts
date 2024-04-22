// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getOperationsState, getQueuesState } from '../../data/store/selectors/nodeSelection.selectors';
import { selectOperation, selectQueue } from '../../data/store/slices/nodeSelection.slice';
import { GraphVertexType } from '../../data/GraphNames';
import usePerfAnalyzerFileLoader from './usePerfAnalyzerFileLoader.hooks';

const useSelectableGraphVertex = () => {
    const dispatch = useDispatch();
    const currentGraphName = useContext(GraphOnChipContext).getActiveGraphName();
    const { getOperand } = useContext(GraphOnChipContext);

    const {loadPerfAnalyzerGraph} = usePerfAnalyzerFileLoader();

    const operationsState = useSelector(getOperationsState);
    const queuesState = useSelector(getQueuesState);

    return {
        disabledQueue: (name: string) => queuesState[currentGraphName]?.[name]?.selected === undefined,
        selected: (name: string) => {
            const operand = getOperand(name);

            if (!operand) {
                return false;
            }

            const isOperationSelected = operationsState[operand.graphName]?.[name]?.selected;
            const isQueueSelected = queuesState[operand.graphName]?.[name]?.selected;

            return isOperationSelected ?? isQueueSelected ?? false;
        },
        selectQueue: (queueName: string, selected: boolean) =>
            dispatch(selectQueue({ graphName: currentGraphName, queueName, selected })),
        selectOperation: (opName: string, selected: boolean) =>
            dispatch(selectOperation({ graphName: currentGraphName, opName, selected })),
        selectOperand: (name: string, selected: boolean) => {
            const operand = getOperand(name);

            if (operand) {
                if (operand.type === GraphVertexType.QUEUE) {
                    dispatch(selectQueue({ graphName: operand.graphName, queueName: name, selected }));
                } else {
                    dispatch(selectOperation({ graphName: operand.graphName, opName: name, selected }));
                }
            }
        },
        navigateToGraph: (operandName:string) => {
            return () => {
                const operand = getOperand(operandName);
                if (operand) {
                    loadPerfAnalyzerGraph(operand.graphName);
                }
            };
        }
    };
};

export default useSelectableGraphVertex;
