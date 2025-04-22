const slugify = require("slugify");

const variables = (elements, separator = "\n") => {
    var fields = elements.map(element => element.fields?.map(field => {
        return `\t\t${slugify(field.name)}:${typeMapping(field.type, field.cardinality)}`
    }).join(separator ? separator : "\n"))
    return fields
}

const variableAssignments = (elementFields, sourceName, source, separator, assignmentOperator) => {

    var fields = elementFields?.map(field => {
        var sourceMapping = processSourceMapping(field, sourceName, source, assignmentOperator)
        if (sourceMapping) {
            return `\t\t\t${sourceMapping}`
        }
    }).filter(it => it).join(separator ? separator : ",\n")
    return fields
}


const processSourceMapping = (targetField, sourceName, source, assigmentOperator = "=") => {
    var name = targetField.name
    var field = source.fields?.find((field) => field.name === name)
    if (field) {
        if (targetField.cardinality === "List" && field.cardinality !== "List") {
            //adding an element to a list
            return `${targetField.name}.add(${sourceName}.${field.name})`
        } else {
            if (targetField.cardinality === "List" && targetField.mutable) {
                return `${targetField.name}${assigmentOperator}${sourceName}.${field.name}?.toMutableList()`;
            } else {
                return `${targetField.name}${assigmentOperator}${sourceName}.${field.name}`;
            }
        }
    }
    var mapping = source.fields?.find((field) => targetField.mapping === field.name)
    if (mapping) {
        if (targetField.cardinality === "List" && mapping.cardinality !== "List") {
            return `${targetField.name}.add(${sourceName}.${targetField.mapping})`
        } else {
            return `${targetField.name}${assigmentOperator}${sourceName}.${targetField.mapping}`
        }

    }
    //return `${targetField.name}${assigmentOperator}${sourceName}.${targetField.name}`
    return ``
}

module.exports = {variables, variableAssignments, processSourceMapping}
