export enum ParsingErrors {
    TOTAL_OP_CYCLES_IS_ZERO = 'total_op_cycles_is_zero',
}

export interface ParsingError {
    type: ParsingErrors;
    message: string;
}
