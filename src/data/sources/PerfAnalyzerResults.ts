import type { GraphName, OperationName } from '../GraphTypes';

export interface PerfAnalyzerResultsJson {
    [coreId: string]: CorePerfJson; // Maps a core ID to a perf analyzer result
}

export interface PerfAnalyzerResultsPerOpJSON {
    [opName: string]: {
        'op-attributes': OpAttributesJSON;
        'op-measurements': MeasurementsJSON;
        'core-measurements': CoreMeasurementsJSON;
    };
}

export type OpPerformanceByOp = Map<string, OpPerfJSON>;

export interface OpAttributesJSON {
    /** The epoch IDs that are captured in this analyzer result. Should be the same for every core result in this graph. */
    global_epoch_ids: number[];

    /** The program names which ran the epochs for this result */
    program_names: string[];

    /** The graph that this result analyzes. Should be the same as the name of the folder that contained this result's data file. */
    graph_name: GraphName;

    warnings: string;

    /** The Operation that was mapped to this core */
    op_name: OperationName;

    /** The range of input indices these results apply to.
     *
     * Format `${inputId: number}->${inputId: number}`
     */
    first_to_last_input: string;

    /** The size of the grid that this core belongs to.
     *
     *  Format `[${width: number},${height: number}]`
     */
    grid_size: string;
}

export interface OpPerfJSON extends MeasurementsJSON, OpAttributesJSON {}

export interface CorePerfJson extends MeasurementsJSON {}

interface MeasurementsJSON {
    warnings: string;
    kernel_total_runtime: number; // Key result for ranking op & core performance
    kernel_runtime_per_input: number;
    model_runtime_per_input: number;
    kernel_math_utilization: number;
    model_math_utilization: number;
    bw_limited_factor: number; // Bandwidth-limited factor. This is a key result for analyzing total runtime.
    slowest_operand: string; // Either "output" or "input-<index>"
    bw_bound_total_runtime: number;
    bw_bound_runtime_per_input: number;
    bw_bound_math_utilization: number;
    output_pipe_bw_0: number; // Available vs required bandwidth for all operands
    required_output_pipe_bw_0: number;
    input_pipe_bw_0: number;
    required_input_bw_0: number;
    input_pipe_bw_1: number;
    required_input_bw_1: number;
}

export interface CoreMeasurementsJSON {
    [coreId: string]: CorePerfJson;
}

