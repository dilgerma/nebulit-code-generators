/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

const schema = require('fluent-json-schema')

function parseSchema(element) {

    let schemaElement = schema.object()
    schemaElement = schemaElement.title(element.title)
        .description(element.description)
    element.fields?.forEach(field => {
        if (field.type !== "Custom") {
            schemaElement = schemaElement.prop(field.name, fieldType(field.type, field.cardinality).additionalProperties(true));
        }else {
            try {
                let customSchema = field.schema ? JSON.parse(field.schema) : undefined;
                let customSchemaObject = schema.object()

                // Add properties from the parsed schema
                Object.keys(customSchema).forEach(key => {
                    const fieldType = customSchema[key]
                    customSchemaObject = customSchemaObject.prop(key, getSchemaTypeFromString(fieldType))
                });

                schemaElement = schemaElement.prop(field.name, fieldType(field.type, field.cardinality).additionalProperties(customSchemaObject));
            } catch (e) {
                console.log(e)
                schemaElement = schemaElement.prop(field.name, fieldType(field.type, field.cardinality));
            }
        }
    })
    return schemaElement.valueOf()

}

function fieldType(type, cardinality) {

    if (cardinality === "Single") {
        switch (type) {
            case "String":
                return schema.string()
            case "Boolean":
                return schema.boolean()
            case "Double":
                return schema.number()
            case "Long":
                return schema.number()
            case "Integer":
                return schema.integer()
            case "UUID":
                return schema.string().format("uuid")
            case "Date":
                return schema.string().format("date")
            case "DateTime":
                return schema.string().format("date-time")
            case "Custom":
                return schema.object()
            default:
                return schema.string()
        }
    } else {
        return schema.array().items(
            fieldType(type, "Single")
        )
    }
}

module.exports = {parseSchema, fieldType}
