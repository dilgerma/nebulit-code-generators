
const variableAssignments = (elementFields, sourceName, source, separator, assignmentOperator, wrapper = (field, renderedItem)=>renderedItem) => {

    var fields = elementFields?.map(field => {
        var sourceMapping = processSourceMapping(field, sourceName, source, assignmentOperator,wrapper)
        if (sourceMapping) {
            return `\t\t\t${sourceMapping}`
        }
    }).filter(it => it).join(separator ? separator : ",\n")
    return fields
}

const renderAssignmenet = (field, sourceName, fieldName, wrapper) => {
    return wrapper(field, `${sourceName}.${fieldName}`)
}

const processSourceMapping = (targetField, sourceName, source, assigmentOperator = "=",wrapper = (field, renderedItem)=>renderedItem) => {
    var name = targetField.name
    var field = source.fields?.find((field) => field.name === name)
    if (field) {
        if (targetField.cardinality === "List" && field.cardinality !== "List") {
            //adding an element to a list
            return `${targetField.name}.add(${renderAssignmenet(field, sourceName, field.name, wrapper)})`
        } else {
            if (targetField.cardinality === "List" && targetField.mutable) {
                return `${targetField.name}${assigmentOperator}${renderAssignmenet(field, sourceName, field.name, wrapper)}?.toMutableList()`;
            } else {
                return `${targetField.name}${assigmentOperator}${renderAssignmenet(field, sourceName, field.name, wrapper)}`;
            }
        }
    }
    var mapping = source.fields?.find((field) => targetField.mapping === field.name)
    if (mapping) {
        if (targetField.cardinality === "List" && mapping.cardinality !== "List") {
            return `${targetField.name}.add(${renderAssignmenet(field, sourceName, targetField.mapping, wrapper)})`
        } else {
            return `${targetField.name}${assigmentOperator}${renderAssignmenet(field, sourceName, targetField.mapping, wrapper)}`
        }

    }
    //return `${targetField.name}${assigmentOperator}${sourceName}.${targetField.name}`
    return ``
}
module.exports = {variableAssignments, processSourceMapping}
