// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import draft06 from 'ajv/lib/refs/json-schema-draft-06.json';

const ymlSchema = {
    $schema: 'http://json-schema.org/draft-06/schema#',
    $ref: '#/definitions/Welcome2',
    definitions: {
        Welcome2: {
            type: 'object',
            additionalProperties: false,
            properties: {
                arch: {
                    type: 'string',
                },
                slowest_op_cycles: {
                    type: 'integer',
                },
                bw_limited_op_cycles: {
                    type: 'integer',
                },
                nodes: {
                    type: 'array',
                    items: {
                        $ref: '#/definitions/Node',
                    },
                },
                dram_channels: {
                    type: 'array',
                    items: {
                        $ref: '#/definitions/DRAMChannel',
                    },
                },
            },
            required: ['arch', 'bw_limited_op_cycles', 'nodes', 'slowest_op_cycles'],
            title: 'Welcome2',
        },
        DRAMChannel: {
            type: 'object',
            additionalProperties: true,
            properties: {
                subchannels: {
                    type: 'array',
                    items: {
                        type: 'object',
                        additionalProperties: {
                            $ref: '#/definitions/Dram0Inout',
                        },
                    },
                },
                dram0_inout: {
                    $ref: '#/definitions/Dram0Inout',
                },
                dram1_inout: {
                    $ref: '#/definitions/Dram0Inout',
                },
            },
            required: [],
            title: 'DRAMChannel',
        },
        MappedPipes: {
            type: 'object',
            additionalProperties: false,
            title: 'MappedPipes',
        },
        Dram0Inout: {
            type: 'object',
            additionalProperties: false,
            properties: {
                num_occupants: {
                    type: 'integer',
                },
                total_data_in_bytes: {
                    type: 'integer',
                },
                mapped_pipes: {
                    $ref: '#/definitions/MappedPipes',
                },
                max_link_bw: {
                    type: 'number',
                },
            },
            required: ['mapped_pipes', 'max_link_bw', 'num_occupants', 'total_data_in_bytes'],
            title: 'Dram0Inout',
        },
        Node: {
            type: 'object',
            additionalProperties: false,
            properties: {
                location: {
                    type: 'array',
                    items: {
                        type: 'integer',
                    },
                },
                type: {
                    $ref: '#/definitions/Type',
                },
                op_name: {
                    type: 'string',
                },
                op_cycles: {
                    $ref: '#/definitions/OpCycles',
                },
                links: {
                    type: 'object',
                    additionalProperties: {
                        $ref: '#/definitions/Link',
                    },
                },
                dram_channel: {
                    type: 'integer',
                },
                dram_subchannel: {
                    type: 'integer',
                },
            },
            required: ['links', 'location', 'op_cycles', 'op_name', 'type'],
            title: 'Node',
        },
        Link: {
            type: 'object',
            additionalProperties: false,
            properties: {
                num_occupants: {
                    type: 'integer',
                },
                total_data_in_bytes: {
                    type: 'integer',
                },
                mapped_pipes: {
                    type: 'object',
                    additionalProperties: {
                        type: 'integer',
                    },
                },
                max_link_bw: {
                    type: 'integer',
                },
            },
            required: ['mapped_pipes', 'max_link_bw', 'num_occupants', 'total_data_in_bytes'],
            title: 'Link',
        },
        OpCycles: {
            anyOf: [
                {
                    type: 'integer',
                },
                {
                    type: 'string',
                },
            ],
            title: 'OpCycles',
        },
        Type: {
            type: 'string',
            enum: ['core', 'dram', 'router', 'eth'],
            title: 'Type',
        },
    },
};

const ajv = new Ajv();
ajv.addMetaSchema(draft06);
addFormats(ajv);

const yamlValidate: ValidateFunction<any> = ajv.compile(ymlSchema);
export default yamlValidate;
