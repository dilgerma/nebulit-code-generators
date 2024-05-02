const schema = require('fluent-json-schema')

function parseSchema(element) {

    let schemaElement = schema.object()
    schemaElement = schemaElement.title(element.title)
        .description(element.description)
    element.fields?.forEach(field => {
        schemaElement = schemaElement.prop(field.name, fieldType(field.type, field.cardinality))
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
                return schema.string().format("date-time")
            case "Custom":
                return schema.object().additionalProperties(true)
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
