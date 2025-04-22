const {generators} = require("../../app");

class ClassesGenerator {

    static generateDataClass(name, fields) {
        return `data class ${name}(${this.generateVariables(fields, ",\n")})`
    }

    static generateVariables(fields, separator = "\n") {

        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}`;
            } else {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}`;
            }
        }).join(separator)
    }

}


function idType(element) {
    var idField = element.fields?.find(it => it.idAttribute)
    return idField ? typeMapping(idField.type, idField.cardinality, idField.optional, idField.mutable) : "java.util.UUID"
}

const typeMapping = (fieldType, fieldCardinality, optional, mutable) => {
    var fieldType;
    switch (fieldType?.toLowerCase()) {
        case "string":
            fieldType = optional ? "String?" : "String";
            break
        case "double":
            fieldType = optional ? "Double?" : "Double";
            break
        case "int":
            fieldType = optional ? "Int?" : "Int";
            break
        case "long":
            fieldType = optional ? "Long?" : "Long";
            break
        case "boolean":
            fieldType = optional ? "Boolean?" : "Boolean";
            break
        case "date":
            fieldType = optional ? "LocalDate?" : "LocalDate";
            break
        case "datetime":
            fieldType = optional ? "LocalDateTime?" : "LocalDateTime";
            break
        case "uuid":
            fieldType = optional ? "UUID?" : "UUID";
            break
        default:
            fieldType = optional ? "String?" : "String";
            break
    }
    if (fieldCardinality?.toLowerCase() === "list") {
        return mutable ? `MutableList<${fieldType}>` : `List<${fieldType}>`
    } else {
        return fieldType
    }

}

const typeImports = (fields, additionalImports) => {
    if (!fields || fields.length === 0) {
        return []
    }
    var imports = fields?.map((field) => {
        switch (field.type?.toLowerCase()) {
            case "date":
                return ["import java.time.LocalDate", "import org.springframework.format.annotation.DateTimeFormat"]
            case "datetime":
                return ["import java.time.LocalDateTime", "import org.springframework.format.annotation.DateTimeFormat"]
            case "uuid":
                return ["import java.util.UUID"]
        }
        switch (field.cardinality?.toLowerCase()) {
            case "list":
                return ["import kotlin.collections.List"]
            default:
                return []
        }
    }).concat(additionalImports)
    return Array.from([...new Set(imports?.flat() ?? [])]).flat().join(";\n")

}

module.exports = {ClassesGenerator, typeMapping, typeImports, idType}
