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


// required_output_pipe_bw_
