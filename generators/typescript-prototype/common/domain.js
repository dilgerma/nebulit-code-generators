var slugify = require('slugify')

const variables = (elements) => {
    var fields = elements.map(element => element.fields?.map(field => {
        return `\t\t${slugify(field.name)}:${typeMapping(field.type, field.cardinality)}`
    }).join("\n"))
    return fields
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
        default:
            defaultValue = "undefined";
            break;
    }

    return defaultValue
}

const renderUnionTypes = (types)=>{
    return types.join("|\n\t")
}

const renderImports = (basePath, types)=> {
    return types.map(type => `import {${type}} from "${basePath}/${type}"`).join("\n")
}

module.exports = {typeMapping, defaultMapping, variables, variablesDefaults,renderUnionTypes, renderImports}
