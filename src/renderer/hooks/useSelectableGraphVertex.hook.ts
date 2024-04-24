// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getOperandState } from '../../data/store/selectors/nodeSelection.selectors';
import { selectOperand } from '../../data/store/slices/nodeSelection.slice';
import usePerfAnalyzerFileLoader from './usePerfAnalyzerFileLoader.hooks';

const useSelectableGraphVertex = () => {
    const dispatch = useDispatch();
    const { getOperand } = useContext(GraphOnChipContext);

    const { loadPerfAnalyzerGraph } = usePerfAnalyzerFileLoader();

    const operandState = useSelector(getOperandState);

    return {
        disabledOperand: (name: string) => operandState[name]?.selected === undefined,
        selected: (name: string) => operandState?.[name]?.selected ?? false,
        selectOperand: (name: string, selected: boolean) => {
            const operand = getOperand(name);

            if (operand) {
                dispatch(selectOperand({ operandName: name, selected }));
            }
        },
        navigateToGraph: (operandName: string) => {
            return () => {
                const operand = getOperand(operandName);
                if (operand) {
                    loadPerfAnalyzerGraph(operand.graphName);
                }
            };
        },
    };
};

export default useSelectableGraphVertex;
