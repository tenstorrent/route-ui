/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { OperandDirection, OperandPerformance } from '../data/OpPerfDetails';

export const calculateSlowestOperand = (operand: string): OperandPerformance | null => {
    let operandType;
    if (operand.startsWith(OperandDirection.INPUT)) {
        operandType = OperandDirection.INPUT;
    } else if (operand.startsWith(OperandDirection.OUTPUT)) {
        operandType = OperandDirection.OUTPUT;
    } else {
        return null;
    }

    return {
        direction: operandType,
        index: parseInt(operand.split('-')[1], 10) || 0,
    };
};

/** there is a single file that follows this pattern out of the entire data set
 * so we are only changing the rendering to the user
 * it appears impractical to make a global change */
export const formatNodeUID = (uid: string): string => {
    return uid.replace(/^(\d+)-(\d+)-(\d+)$/, '$1-$3-$2');
};
