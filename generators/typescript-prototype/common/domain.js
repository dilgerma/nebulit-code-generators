var slugify = require('slugify')

const variables = (elements, separator = "\n") => {
    var fields = elements.map(element => element.fields?.map(field => {
        return `\t\t${slugify(field.name)}:${typeMapping(field.type, field.cardinality)}`
    }).join(separator ? separator : "\n"))
    return fields
}

const variableAssignments = (elementFields, sourceName, source, separator, assignmentOperator) => {
    var fields = elementFields?.map(field => {
        return `\t\t\t${processSourceMapping(field, sourceName, source, assignmentOperator)}`
    }).join(separator ? separator : ",\n")
    return fields
}


const processSourceMapping = (targetField, sourceName, source, assigmentOperator="=") => {
    var name = targetField.name
    var field = source.fields?.find((field) => field.name === name)
    if (field) {
        return `${targetField.name}${assigmentOperator}${sourceName}.${field.name}`
    }
    var mapping = source.fields?.find((field) => targetField.mapping === field.name)
    if (mapping) {
        return `${targetField.name}${assigmentOperator}${sourceName}.${targetField.mapping}`
    }
    return `${targetField.name}${assigmentOperator}${sourceName}.${targetField.name}`
}

const variablesDefaults = (elements) => {
    var fields = elements.map(element => element.fields?.map(field => {
        return `\t\t${slugify(field.name)}:${defaultMapping(field.type, field.cardinality)}`
    }).join(",\n"))
    return fields
}

const typeMapping = (fieldType, fieldCardinality) => {
    var fieldType;
    switch (fieldType?.toLowerCase()) {
        case "string":
            fieldType = "string";
            break
        case "double":
            fieldType = "number";
            break
        case "long":
            fieldType = "number";
            break
        case "int":
            fieldType = "number";
            break
        case "boolean":
            fieldType = "boolean";
            break
        case "date":
            fieldType = "date";
            break
        case "uuid":
            fieldType = "string";
            break
        default:
            fieldType = "string";
            break
    }
    if (fieldCardinality?.toLowerCase() === "list") {
        return `${fieldType}[]`
    } else {
        return fieldType
    }

}

const defaultMapping = (fieldType, fieldCardinality) => {
    var defaultValue;
    if (fieldCardinality?.toLowerCase() === "list") {
        return "[]"
    }
    switch (fieldType?.toLowerCase()) {
        case "string":
            defaultValue = "\"\"";
            break;
        case "uuid":
            defaultValue = "\"\"";
            break;
        case "boolean":
            defaultValue = "false";
            break;
        case "int":
            defaultValue = 0
            break;
        case "double":
            defaultValue = 0.0
            break;
        default:
            defaultValue = "undefined";
            break;
    }

    return defaultValue
}

const renderUnionTypes = (types) => {
    return types.join("|\n\t")
}

const renderImports = (basePath, types) => {
    return Array.from(new Set(types.map(type => `import {${type}} from "${basePath}/${type}"`))).join("\n")
}

module.exports = {
    typeMapping,
    defaultMapping,
    variables,
    variablesDefaults,
    renderUnionTypes,
    renderImports,
    variableAssignments,
    processSourceMapping
}
