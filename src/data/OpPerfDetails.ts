/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { MeasurementsJSON, OpPerfJSON } from './sources/PerfAnalyzerResults';
import { GraphName, OperationName } from './GraphNames';
/*  eslint-disable no-undef */
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

    private _slowestOperandPerformance: OperandPerformance | undefined;

    get slowestOperandPerformance(): OperandPerformance | null {
        if (this._slowestOperandPerformance !== undefined) {
            return this._slowestOperandPerformance;
        }
        let operandType;
        if (this.slowest_operand.startsWith(OperandDirection.INPUT)) {
            operandType = OperandDirection.INPUT;
        } else if (this.slowest_operand.startsWith(OperandDirection.OUTPUT)) {
            operandType = OperandDirection.OUTPUT;
        } else {
            return null;
        }

        this._slowestOperandPerformance = {
            direction: operandType,
            index: parseInt(this.slowest_operand.split('-')[1], 10) || 0,
        };

        return this._slowestOperandPerformance;
    }

    get slowestOperandDetails() {
        if (this.slowestOperandPerformance?.direction && this.slowestOperandPerformance?.index !== null) {
            const [actual, required] =
                this.slowestOperandPerformance?.direction === OperandDirection.INPUT
                    ? [OpPerfDynamicProperties.INPUT_PIPE_BW, OpPerfDynamicProperties.REQUIRED_INPUT_BW]
                    : [OpPerfDynamicProperties.OUTPUT_PIPE_BW, OpPerfDynamicProperties.REQUIRED_OUTPUT_BW];
            return {
                type: this.slowestOperandPerformance?.direction,
                index: this.slowestOperandPerformance?.index,
                // @ts-expect-error
                actual: this[`${actual}${this.slowestOperandPerformance?.index}`],
                // @ts-expect-error
                required: this[`${required}${this.slowestOperandPerformance?.index}`],
                bw_limited_factor: this.bw_limited_factor,
            };
        }

        return null;
    }

    // TODO: not clear if these will ne needed, to reevaluate

    public getInputPipeBw(index: number): number {
        return this[`${OpPerfDynamicProperties.INPUT_PIPE_BW}${index}`];
    }

    public getRequiredInputBw(index: number): number {
        return this[`${OpPerfDynamicProperties.REQUIRED_INPUT_BW}${index}`];
    }

    public getOutputPipeBw(index: number): number {
        return this[`${OpPerfDynamicProperties.OUTPUT_PIPE_BW}${index}`];
    }

    public getRequiredOutputBw(index: number): number {
        // @ts-expect-error
        return this[`${OpPerfDynamicProperties.REQUIRED_OUTPUT_BW}${index}`];
    }
}

// operrand type is a misleading term, its really a direction in this case;
export enum OperandDirection {
    INPUT = 'input',
    OUTPUT = 'output',
}

export type OperandPerformance = {
    direction: OperandDirection;
    index: number;
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
    REQUIRED_INPUT_BW = 'required_input_bw_', // inconsistent naming in source data
    OUTPUT_PIPE_BW = 'output_pipe_bw_',
    REQUIRED_OUTPUT_BW = 'required_output_pipe_bw_',
}
