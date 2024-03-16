var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')
var config = require('./../../config.json')
const {answers} = require("../app");
const {givenAnswers} = require("./index");


module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
    }

    async prompting() {
        this.answers = await this.prompt([
            {
                type: 'checkbox',
                name: 'aggregates',
                message: 'Welche Aggregates soll generiert werden?',
                choices: config?.aggregates?.map((item, idx) => item.title).sort()
            }]);

    }

    writeAggregates() {
        this.answers.aggregates.forEach((aggregate) => {
            this._writeAggregates(config.aggregates.find(item => item.title === aggregate))
        });
    }

    _writeAggregates(aggregate) {
        this.fs.copyTpl(
            this.templatePath(`src/components/Aggregate.kt.tpl`),
            this.destinationPath(`${this.givenAnswers?.appName}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/domain/${this._aggregateTitle(aggregate.title)}.kt`),
            {
                _rootPackageName: this.givenAnswers.rootPackageName,
                _name: this._aggregateTitle(aggregate.title),
                _fields: VariablesGenerator.generateVariables(
                    aggregate.fields
                ),
                _typeImports: typeImports(aggregate.fields)

            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/AggregateService.kt.tpl`),
            this.destinationPath(`${this.givenAnswers?.appName}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/support/${this._aggregateTitle(aggregate.title)}Service.kt`),
            {
                _rootPackageName: this.givenAnswers.rootPackageName,
                _aggregate: this._aggregateTitle(aggregate.title),
                _typeImports: typeImports(aggregate.fields)
            }
        )


    }

    _aggregateTitle(title) {
        return `${capitalizeFirstCharacter(title)}Aggregate`
    }


};


class ConstructorGenerator {

//(: {name, type, example, mapping}
    static generateConstructorVariables(fields, overrides) {
        return `${fields?.map((field) => (overrides?.includes(field.name) ? "override " : "") + "var " + field.name + ":" + typeMapping(field.type)).join(",")}`
    }
}

class VariablesGenerator {

//(: {name, type, example, mapping}
    static generateVariables(fields) {
        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality)} = emptyList();`;
            } else {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality)}? = null;`;
            }
        }).join("\n")
    }

    static generateInvocation(fields) {
        return fields?.map((variable) => {

            return `${variable.name}`;

        }).filter((it) => it !== "").join(",")
    }

    static generateRestParamInvocation(fields) {
        return fields?.map((variable) => {
            if (variable.type?.toLowerCase() == "date") {

                return `@DateTimeFormat(pattern = "dd.MM.yyyy") @RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality)}`;
            } else {
                return `@RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality)}`;
            }

        }).filter((it) => it !== "").join(",")
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

const typeImports = (fields) => {
    var imports = fields.map((field) => {
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
    })
    return imports.flat().join(";\n")

}

const invocation = (type, fields) => {
    return `new ${type}(${fields.map((it) => variableNameOrMapping(it)).join(",")})`
}

const receiverInvocation = (type, receiver) => {
    return `new ${type.title}(${type.fields.map((it) => receiver + "." + variableNameOrMapping(it)).join(",")})`
}

const variableNameOrMapping = (field) => {
    return (field.mapping && field.mapping !== "") ? field.mapping : field.name
}

const packageName = (type) => {
    switch (type.type) {
        case "COMMAND":
            return "commands"
        case "EVENT":
            return "events"
        case "READMODEL":
            return "readmodels"
    }
}


const defaultValue = (type, cardinality = "single") => {
    switch (type.toLowerCase()) {
        case "string":
            return cardinality.toLowerCase() === "list" ? "[]" : "\"\""
        case "boolean":
            return cardinality.toLowerCase() === "list" ? "[]" : "false"
    }
}


function toCamelCase(prefix, variableName) {
    return (prefix + variableName).replace(/_([a-z])/g, function (match, group1) {
        return group1.toUpperCase();
    });
}

function capitalizeFirstCharacter(inputString) {
    // Check if the string is not empty
    if (inputString.length > 0) {
        // Capitalize the first character and concatenate the rest of the string
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    } else {
        // Return an empty string if the input is empty
        return "";
    }
}
