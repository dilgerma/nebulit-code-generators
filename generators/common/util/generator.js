const {generators} = require("../../app");

class ClassesGenerator {

    static generateDataClass(name, fields) {
        return `data class ${name}(${this.generateVariables(fields, ",\n")})`
    }

    static generateVariables(fields, separator="\n") {

        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality)}`;
            } else {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality)}`;
            }
        }).join(separator)
    }

}


const typeMapping = (fieldType, fieldCardinality) => {
    var fieldType;
    switch (fieldType?.toLowerCase()) {
        case "string":
            fieldType = "String";
            break
        case "double":
            fieldType = "Double";
            break
        case "long":
            fieldType = "Long";
            break
        case "boolean":
            fieldType = "Boolean";
            break
        case "date":
            fieldType = "LocalDate";
            break
        case "uuid":
            fieldType = "UUID";
            break
        default:
            fieldType = "String";
            break
    }
    if (fieldCardinality?.toLowerCase() === "list") {
        return `List<${fieldType}>`
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
            case "uuid":
                return ["import java.util.UUID"]
            default:
                return []
        }
        switch (field.cardinality?.toLowerCase()) {
            case "LIST":
                return ["java.util.List"]
            default:
                return []
        }
    }).concat(additionalImports)
    return Array.from([...new Set(imports?.flat() ?? [])]).flat().join(";\n")

}

module.exports = {ClassesGenerator, typeMapping, typeImports}
