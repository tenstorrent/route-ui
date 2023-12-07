import { CoreMeasurementsJSON, MeasurementsJSON, OpPerfJSON } from './sources/PerfAnalyzerResults';
import { GraphName, OperationName } from './GraphTypes';

export class MeasurementDetails implements MeasurementsJSON {
    [key: `input_pipe_bw_${number}`]: number; // available bandwidth (hole size)

    [key: `output_pipe_bw_${number}`]: number;

    [key: `required_input_bw_${number}`]: number; // actual bandwidth (packet size)

    [key: `required_output_bw_${number}`]: number;

    bw_bound_math_utilization: number;

    bw_bound_runtime_per_input: number;

    bw_bound_total_runtime: number;

    bw_limited_factor: number; // required_input_bw_/input_pipe_bw_

    kernel_math_utilization: number;

    kernel_runtime_per_input: number;

    kernel_total_runtime: number;

    model_math_utilization: number;

    model_runtime_per_input: number;

    slowest_operand: string;

    warnings: string;

    constructor(json: MeasurementsJSON) {
        this.bw_bound_math_utilization = json.bw_bound_math_utilization;
        this.bw_bound_runtime_per_input = json.bw_bound_runtime_per_input;
        this.bw_bound_total_runtime = json.bw_bound_total_runtime;
        this.bw_limited_factor = json.bw_limited_factor;
        this.kernel_math_utilization = json.kernel_math_utilization;
        this.kernel_runtime_per_input = json.kernel_runtime_per_input;
        this.kernel_total_runtime = json.kernel_total_runtime;
        this.model_math_utilization = json.model_math_utilization;
        this.model_runtime_per_input = json.model_runtime_per_input;
        this.slowest_operand = json.slowest_operand;
        this.warnings = json.warnings;

        const dynamicPropertyPrefixes = Object.values(OpPerfDynamicProperties);
        Object.keys(json).forEach((key) => {
            if (dynamicPropertyPrefixes.some((prefix) => key.startsWith(prefix))) {
                // @ts-ignore
                this[key] = json[key];
            }
        });
    }

    private _slowestOperand: OperandPerformance | undefined;

    get slowestOperand(): OperandPerformance | null {
        if (this._slowestOperand !== undefined) {
            return this._slowestOperand;
        }
        let operandType;
        if (this.slowest_operand.startsWith(OperandDirection.INPUT)) {
            operandType = OperandDirection.INPUT;
        } else if (this.slowest_operand.startsWith(OperandDirection.OUTPUT)) {
            operandType = OperandDirection.OUTPUT;
        } else {
            return null;
        }

        this._slowestOperand = {
            direction: operandType,
            index: parseInt(this.slowest_operand.split('-')[1], 10) || 0,
        };

        return this._slowestOperand;
    }

    get slowestOperandDetails() {
        if (this.slowestOperand?.direction && this.slowestOperand?.index !== null) {
            const [actual, required] =
                this.slowestOperand?.direction === OperandDirection.INPUT
                    ? [OpPerfDynamicProperties.INPUT_PIPE_BW, OpPerfDynamicProperties.REQUIRED_INPUT_BW]
                    : [OpPerfDynamicProperties.OUTPUT_PIPE_BW, OpPerfDynamicProperties.REQUIRED_OUTPUT_BW];
            return {
                type: this.slowestOperand?.direction,
                index: this.slowestOperand?.index,
                actual: this[`${actual}${this.slowestOperand?.index}`],
                required: this[`${required}${this.slowestOperand?.index}`],
                bw_limited_factor: this.bw_limited_factor,
            };
        }

        return null;
    }

    // TODO: not clear if these will ne needed, to reevaluate

    // public getInputPipeBw(index: number): number {
    //     return this[`${OpPerfDynamicProperties.INPUT_PIPE_BW}${index}`];
    // }
    //
    // public getRequiredInputBw(index: number): number {
    //     return this[`${OpPerfDynamicProperties.REQUIRED_INPUT_BW}${index}`];
    // }
    //
    // public getOutputPipeBw(index: number): number {
    //     return this[`${OpPerfDynamicProperties.OUTPUT_PIPE_BW}${index}`];
    // }
    //
    // public getRequiredOutputBw(index: number): number {
    //     return this[`${OpPerfDynamicProperties.REQUIRED_OUTPUT_BW}${index}`];
    // }
}

// operrand type is a misleading term, its really a direction in this case;
export enum OperandDirection {
    INPUT = 'input',
    OUTPUT = 'output',
}

type OperandPerformance = {
    direction: OperandDirection;
    index: number | null;
};

export class OpPerfDetails extends MeasurementDetails implements OpPerfJSON {
    first_to_last_input: string;

    global_epoch_ids: number[];

    graph_name: GraphName;

    grid_size: string;

    op_name: OperationName;

    program_names: string[];

    constructor(json: OpPerfJSON) {
        super(json);
        this.first_to_last_input = json.first_to_last_input;
        this.global_epoch_ids = json.global_epoch_ids;
        this.graph_name = json.graph_name;
        this.grid_size = json.grid_size;
        this.op_name = json.op_name;
        this.program_names = json.program_names;
    }
}

export enum OpPerfDynamicProperties {
    INPUT_PIPE_BW = 'input_pipe_bw_',
    REQUIRED_INPUT_BW = 'required_input_bw_',
    OUTPUT_PIPE_BW = 'output_pipe_bw_',
    REQUIRED_OUTPUT_BW = 'required_output_bw_',
}