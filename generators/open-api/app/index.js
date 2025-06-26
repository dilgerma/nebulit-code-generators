/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
const slugify = require("slugify");

let config = {}

module.exports = class extends Generator {

    defaultAppName = "app"
    config;

    constructor(args, opts) {
        super(args, opts);
        config = require(this.env.cwd + "/config.json");
    }

    generateOpenAPI() {

        let spec = this._generateOpenApiSpec(config)
        this.fs.copyTpl(
            this.templatePath('open-api/template.yml'),
            this.destinationPath("open-api.yml"),
            {
                spec: JSON.stringify(spec,null,2)
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
                let prop = { type: typeMap[f.type] || 'string' };
                if (f.cardinality === 'List') {
                    prop = { type: 'array', items: prop };
                }
                properties[f.name] = prop;
                if (!f.optional) required.push(f.name);
            });

            return {
                type: 'object',
                properties,
                ...(required.length ? { required } : {})
            };
        };

        const openapi = {
            openapi: '3.0.3',
            info: {
                title: 'Generated API from config.json',
                version: '1.0.0'
            },
            paths: {},
            components: { schemas: {} }
        };

        config.slices.forEach((slice) => {
            (slice.commands || []).forEach((cmd) => {
                const id = (cmd.fields?.find(field => field.idAttribute)?.name??"aggregateId").toLowerCase();
                const schemaName = cmd.title.replace(/\s+/g, '');
                const endpoint = `/${cmd?.endpoint??(_sliceTitle(slice.title))}/{${id}}`

                openapi.paths[`${endpoint}`] = {
                    post: {
                        summary: cmd.title,
                        parameters: [
                            {
                                name: `${id}`,
                                in: 'path',
                                required: true,
                                schema: {
                                    type: 'string'
                                },
                                description: 'The aggregate identifier'
                            }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: `#/components/schemas/${schemaName}` }
                                }
                            }
                        },
                        responses: { 200: { description: 'OK' } }
                    }
                };
                openapi.components.schemas[schemaName] = makeSchema(cmd.fields);
            });

            (slice.readmodels || []).forEach((rm) => {
                const id = (rm.fields?.find(field => field.idAttribute)?.name??"aggregateId")
                const endpoint = `/${rm?.endpoint??(_sliceTitle(slice.title))}/{${id}}`
                const schemaName = rm.title.replace(/\s+/g, '');
                openapi.paths[`${endpoint}`] = {
                    get: {
                        summary: `Get ${rm.title}`,
                        parameters: [
                            {
                                name: `${id}`,
                                in: 'path',
                                required: true,
                                schema: {
                                    type: 'string'
                                },
                                description: 'The aggregate identifier'
                            }
                        ],
                        responses: {
                            200: {
                                description: 'OK',
                                content: {
                                    'application/json': {
                                        schema: { $ref: `#/components/schemas/${schemaName}` }
                                    }
                                }
                            }
                        }
                    }
                };
                openapi.components.schemas[schemaName] = makeSchema(rm.fields);
            });
        });

        return openapi;
    }

}

function _sliceTitle(title) {
    return slugify(title.replaceAll(" ", "").replace("slice:", "")).replaceAll("-", "").toLowerCase()
}
