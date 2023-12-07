import { OpPerfJSON } from 'data/sources/PerfAnalyzerResults';

export type OperationsTableDictionaryKeyType = keyof OpPerfJSON | 'operation';

type OperationsTableDictionaryType = {
    [key in OperationsTableDictionaryKeyType]: string;
};

const OperationsTableDictionary: Partial<OperationsTableDictionaryType> = {
    grid_size: 'Grid',
    operation: 'Operation',
    kernel_total_runtime: 'Kernel Total Runtime',
    kernel_math_utilization: 'Kernel Math Utilization',
    bw_limited_factor: 'BW Limited Factor',
    slowest_operand: 'Slowest Operand',
    bw_bound_total_runtime: 'BW Bound Total Runtime',
    bw_bound_math_utilization: 'BW Bound Math Utilization',
};

export default OperationsTableDictionary;
