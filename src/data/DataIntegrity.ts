export enum DataIntegrityErrorType {
    TOTAL_OP_CYCLES_IS_ZERO = 'total_op_cycles_is_zero',
}

export interface DataIntegrityError {
    type: DataIntegrityErrorType;
    message: string;
}
