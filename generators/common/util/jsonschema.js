/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

const schema = require('fluent-json-schema')


function buildCustomSchema(schemaString) {
    try {
        const customSchema = JSON.parse(schemaString)
        let customSchemaObject = schema.object()

        // Iterate through the custom schema properties
        Object.keys(customSchema).forEach(key => {
            const customFieldType = customSchema[key]
            customSchemaObject = customSchemaObject.prop(key, fieldType(customFieldType, "Single"))
        })

        return customSchemaObject
    } catch (error) {
        console.error('Error parsing custom schema:', error)
        return schema.object().additionalProperties(true)
    }
}

function parseSchema(element) {

    let schemaElement = schema.object()
    schemaElement = schemaElement.title(element.title)
        .description(element.description)
    element.fields?.forEach(field => {
        if (field.type !== "Custom" || !field.schema) {
            schemaElement = schemaElement.prop(field.name, fieldType(field.type, field.cardinality));
        } else {
            // Handle custom schema
            let customSchemaObject = buildCustomSchema(field.schema)
            schemaElement = schemaElement.prop(field.name,
                field.cardinality === "Single" ? customSchemaObject : schema.array().items(customSchemaObject)
            )
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
