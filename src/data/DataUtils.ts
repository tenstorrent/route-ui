import Ajv, {ValidateFunction} from 'ajv';
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
            },
            required: ['bw_limited_op_cycles', 'nodes', 'slowest_op_cycles'],
            title: 'Welcome2',
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
                internal_links: {
                    $ref: '#/definitions/InternalLinks',
                },
                links: {
                    type: 'object',
                    additionalProperties: {
                        $ref: '#/definitions/LinkValue',
                    },
                },
            },
            required: ['internal_links', 'links', 'location', 'op_cycles', 'op_name', 'type'],
            title: 'Node',
        },
        InternalLinks: {
            type: 'object',
            additionalProperties: false,
            properties: {
                link_in: {
                    $ref: '#/definitions/Link',
                },
                link_out: {
                    $ref: '#/definitions/Link',
                },
            },
            required: ['link_in', 'link_out'],
            title: 'InternalLinks',
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
                    type: 'number',
                },
            },
            required: ['mapped_pipes', 'max_link_bw', 'num_occupants', 'total_data_in_bytes'],
            title: 'Link',
        },
        LinkValue: {
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
            title: 'LinkValue',
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
            enum: ['core', 'router', 'dram', 'eth', 'pcix'],
            title: 'Type',
        },
    },
};

const ajv = new Ajv();
ajv.addMetaSchema(draft06);
addFormats(ajv);


const yamlValidate: ValidateFunction<any> = ajv.compile(ymlSchema);
export default yamlValidate;
