/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator').default;
const slugify = require("slugify");

let config = {}

module.exports = class extends Generator {

    defaultAppName = "app"
    config;

    constructor(args, opts) {
        super(args, opts);

        this.argument('appname', { type: String, required: false });

        const configPath = `${this.env.cwd}/config.json`;

        try {
            config = require(configPath);
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error(`❌ No config.json found at ${configPath}. Please create one first.`);
            } else {
                throw err; // other errors (invalid JSON etc.)
            }
        }
    }

    generateOpenAPI() {

        let spec = this._generateOpenApiSpec(config)
        this.fs.copyTpl(
            this.templatePath('open-api/template.yml'),
            this.destinationPath("open-api.yml"),
            {
                spec: JSON.stringify(spec, null, 2)
            }
        )
    }

    _generateOpenApiSpec(config) {
        const typeMap = {
            UUID: 'string',
            String: 'string',
            Int: 'integer',
            Double: 'number',
            Custom: 'object'
        };

        const makeSchema = (fields) => {
            const properties = {};
            const required = [];

            fields.forEach((f) => {
                let prop = {type: typeMap[f.type] || 'string'};

                // Add format for UUID types
                if (f.type === 'UUID') {
                    prop.format = 'uuid';
                }

                if (f.cardinality === 'List') {
                    prop = {type: 'array', items: prop};
                }
                properties[f.name] = prop;
                if (!f.optional) required.push(f.name);
            });

            return {
                type: 'object',
                properties,
                ...(required.length ? {required} : {})
            };
        };

        const openapi = {
            openapi: '3.0.1',
            info: {
                title: 'OpenAPI definition',
                version: 'v0'
            },
            servers: [
                {
                    url: 'http://localhost:8080',
                    description: 'Generated server url'
                }
            ],
            paths: {},
            components: {schemas: {}}
        };

        // Track global command index for operationId
        let globalCommandIndex = 0;

        config.slices.forEach((slice) => {
            (slice.commands || []).forEach((cmd) => {
                const id = (cmd.fields?.find(field => field.idAttribute)?.name ?? "aggregateId").toLowerCase();
                const schemaName = cmd.title.replace(/\s+/g, '');
                const payloadSchemaName = `${schemaName}Payload`;
                const endpoint = `/${cmd?.endpoint ?? (_sliceTitle(slice.title))}/{${id}}`
                const idField = cmd.fields?.find(field => field.idAttribute);
                const idType = idField?.type || 'UUID';
                const resourceTag = `${cmd?.endpoint ?? (_sliceTitle(slice.title))}-ressource`;

                openapi.paths[endpoint] = {
                    post: {
                        tags: [resourceTag],
                        operationId: globalCommandIndex === 0 ? 'processCommand' : `processCommand_${globalCommandIndex}`,
                        parameters: [
                            {
                                name: id,
                                in: 'path',
                                required: true,
                                schema: {
                                    type: 'string',
                                    ...(idType === 'UUID' ? { format: 'uuid' } : {})
                                }
                            }
                        ],
                        requestBody: {
                            content: {
                                'application/json': {
                                    schema: {$ref: `#/components/schemas/${payloadSchemaName}`}
                                }
                            },
                            required: true
                        },
                        responses: {
                            '200': {
                                description: 'OK',
                                content: {
                                    '*/*': {
                                        schema: { type: 'object' }
                                    }
                                }
                            }
                        }
                    }
                };
                openapi.components.schemas[payloadSchemaName] = makeSchema(cmd.fields);
                globalCommandIndex++;
            });

            (slice.readmodels || []).forEach((rm) => {
                const id = (rm.fields?.find(field => field.idAttribute)?.name ?? "aggregateId").toLowerCase();
                const endpoint = `/${rm?.endpoint ?? (_sliceTitle(slice.title))}/{${id}}`
                const schemaName = rm.title.replace(/\s+/g, '');
                const entitySchemaName = `${schemaName}Entity`;
                const idField = rm.fields?.find(field => field.idAttribute);
                const idType = idField?.type || 'UUID';
                const resourceTag = `${rm?.endpoint ?? (_sliceTitle(slice.title))}-ressource`;

                // Determine if this is a list based only on cardinality attribute
                const isList = rm.cardinality === 'List';

                openapi.paths[endpoint] = {
                    get: {
                        tags: [resourceTag],
                        operationId: `get${schemaName}`,
                        parameters: [
                            {
                                name: id,
                                in: 'path',
                                required: true,
                                schema: {
                                    type: 'string',
                                    ...(idType === 'UUID' ? { format: 'uuid' } : {})
                                }
                            }
                        ],
                        responses: {
                            '200': {
                                description: 'OK',
                                content: {
                                    '*/*': {
                                        schema: {$ref: `#/components/schemas/${schemaName}`}
                                    }
                                }
                            }
                        }
                    }
                };

                // Create the Entity schema (the actual data structure)
                openapi.components.schemas[entitySchemaName] = makeSchema(rm.fields);

                // Create the wrapper schema with 'data' attribute
                if (isList) {
                    openapi.components.schemas[schemaName] = {
                        required: ['data'],
                        type: 'object',
                        properties: {
                            data: {
                                type: 'array',
                                items: {$ref: `#/components/schemas/${entitySchemaName}`}
                            }
                        }
                    };
                } else {
                    openapi.components.schemas[schemaName] = {
                        required: ['data'],
                        type: 'object',
                        properties: {
                            data: {$ref: `#/components/schemas/${entitySchemaName}`}
                        }
                    };
                }
            });
        });

        return openapi;
    }

}

function _sliceTitle(title) {
    return slugify(title.replaceAll(" ", "").replace("slice:", "")).replaceAll("-", "").toLowerCase()
}