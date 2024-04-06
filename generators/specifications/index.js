var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')
const {ensureDirSync} = require("fs-extra");
const {answers} = require("../app");
const {slice} = require("../slices");
const {givenAnswers} = require("./index");
const {v4: uuidv4} = require('uuid');


function _sliceTitle(title) {
    return slugify(title.replace("slice:", ""), "").replaceAll("-", "").toLowerCase()
}

var config = {}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");
    }

    async prompting() {
        var specsFromSlice = config?.slices.filter((slice) => slice.title == this.givenAnswers.slice).flatMap(item => item.specifications)?.map(item => item.title)
        if (specsFromSlice.length > 0) {
            this.answers = await this.prompt([
                {
                    type: 'checkbox',
                    name: 'specifications',
                    message: 'Welche Specifications sollen generiert werden?',
                    choices: specsFromSlice
                }]);
        } else {
            this.log(chalk.blue('Keine Specifications definiert!'))
        }

    }

    writeSpecifications() {
        //this.answers.slices.forEach((slice) => {
        if (this.answers?.specifications?.length > 0) {

            this._writeSpecifications(this.answers.specifications);
        }
        //});
    }

    _writeSpecifications(specifications) {
        var slice = this._findSlice(this.givenAnswers.slice)
        var title = _sliceTitle(slice.title).toLowerCase()

        slice.specifications?.filter((specification) => specifications.includes(specification.title)).forEach((specification) => {
            var specificationName = _specificationTitle(capitalizeFirstCharacter(slugify(specification.title, "")))

            var given = specification.given
            var when = specification.when
            var then = specification.then

            var allElements = given.concat(when).concat(then)
            var allFields = allElements.flatMap((item) => item.fields)
            var _elementImports = generateImports(this.givenAnswers.rootPackageName, title, allElements)
            var _typeImports = typeImports(allFields)
            var aggregateId = uuidv4()
            var defaults = {
                "aggregateId": aggregateId
            }
            this.fs.copyTpl(
                this.templatePath(`src/components/Specification.kt.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/src/test/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${title}/${specificationName}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: specificationName,
                    _elementImports: _elementImports,
                    _typeImports: _typeImports,
                    _given: renderGiven(given, defaults),
                    _when: renderWhen(when, then, defaults),
                    _then: renderThen(then, defaults),
                    _aggregate: _aggregateTitle(this.givenAnswers.aggregate),
                    _aggregateId: aggregateId

                }
            )
        })


    }


    _findSlice(sliceName) {
        return config.slices.find((item) => item.title === sliceName)
    }


};


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
        case "custom":
            fieldType = "CUSTOM";
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

const generateImports = (rootPackageName, sliceName, elements) => {
    var imports = elements?.map((element) => {
        switch (element.type?.toLowerCase()) {
            case "spec_event":
                return `import ${rootPackageName}.events.${_eventTitle(element.title)}`
            case "spec_command":
                return `import ${rootPackageName}.${sliceName}.internal.${_commandTitle(element.title)}`
            case "spec_readmodel":
                return `import ${rootPackageName}.${sliceName}.${_readmodelTitle(element.title)}`
            default:
                console.log("Could not determine imports")
                return ""
        }
    })
    return Array.from(new Set(imports))?.flat()?.join(";\n")
}

const typeImports = (fields) => {
    var imports = fields?.map((field) => {
        switch (field?.type?.toLowerCase()) {
            case "date":
                return ["import java.time.LocalDate", "import org.springframework.format.annotation.DateTimeFormat"]
            case "uuid":
                return ["import java.util.UUID"]
            default:
                return []
        }
        switch (field?.cardinality?.toLowerCase()) {
            case "LIST":
                return ["java.util.List"]
            default:
                return []
        }
    })
    return Array.from(new Set(imports?.flat()))?.join(";\n")

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


const defaultValue = (type, cardinality = "single", name, defaults) => {
    if (cardinality?.toLowerCase() !== "list" && defaults[name]) {
        return renderVariable(defaults[name], type, name, defaults)
    }
    switch (type.toLowerCase()) {
        case "string":
            return cardinality.toLowerCase() === "list" ? "[]" : "\"\"";
        case "boolean":
            return cardinality.toLowerCase() === "list" ? "[]" : "false";
    }
}


function toCamelCase(prefix, variableName) {
    return (prefix + variableName).replace(/_([a-z])/g, function (match, group1) {
        return group1.toUpperCase();
    });
}

function _specificationTitle(title) {
    var adjustedTitle = title.replace("Spec:", "").replace("-", "").trim()
    return `${slugify(capitalizeFirstCharacter(adjustedTitle), "")}Test`
}

function _aggregateTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}Aggregate`
}

function _commandTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}Command`
}

function _restResourceTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}RestController`
}

function _readmodelTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}ReadModel`
}

function _eventTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}Event`
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


function renderThen(thenList, defaults) {
    var then = thenList.map((item) => {

        if (item.type === "SPEC_EVENT") {

            return `\twhenResult.andWaitForEventOfType(${_eventTitle(item.title)}::class.java)
                        ${assertionList(item.fields, defaults)}.toArrive()`

        } else if (item.type === "SPEC_READMODEL") {
            return `\tvar readModel = ${_readmodelTitle(item.title)}().applyEvents(repository.findByAggregateId(AGGREGATE_ID))`
        }

    }).join("\n")

    if (thenList?.length === 0) {
        return "Assertions.fail<Unit>(\"No assertion defined in Model. Manual implementation required\")"
    }
    return then
}


function renderWhen(whenList, thenList, defaults) {
    if (thenList.some((error) => error.type === "SPEC_ERROR")) {
        return whenList.map((command) => {
            return `Assertions.assertThrows(CommandException::class.java) {
                          commandHandler.handle(${_commandTitle(command.title)}(${randomizedInvocationParamterList(command.fields, defaults)}))}`
        }).join("\n");
    } else {
        return whenList.map((command) => {
            return `commandHandler.handle(${_commandTitle(command.title)}(${randomizedInvocationParamterList(command.fields, defaults)}))`
        }).join("\n");
    }

}

function renderGiven(givenList, defaults) {
    var givens = givenList.map((event) => {
        return `
        events.add(RandomData.newInstance(listOf("value")) {
                        ${randomizedInvocationParamterList(event.fields.filter((it) => it.name == "aggregateId"), defaults)}
                        this.value = ${_eventTitle(event.title)}(
                            ${randomizedInvocationParamterList(event.fields, defaults)}
                        )
                    })
        `
    }).join("\n")

    var given = `
    var events = mutableListOf<InternalEvent>()
     ${givens}
     
      events.forEach { event ->
                        run {
                            repository.save(event)
                            event.value?.let { eventPublisher.publishEvent(it) }
                        }
                    }
    `
    return given

}

function renderVariable(variableValue, variableType, variableName, defaults) {

    var value = variableValue
    if (!variableValue && defaults[variableName]) {
        value = defaults[variableName]
    }
    switch (variableType.toLowerCase()) {
        case "uuid":
            return `UUID.fromString("${value}")`;
        case "string":
            return `"${value}"`;
        case "date":
            return `LocalDate.parse("${value}")`;
        case "boolean":
        case "long":
            return `${value}L`;
        case "double":
        case "int":
            return `${value}`;
    }
}

function randomizedInvocationParamterList(variables, defaults) {

    return variables?.map((variable) => {
        if (variable.example !== "") {
            return `\t${variable.name} = ${renderVariable(variable.example, variable.type, variable.name, defaults)}`;
        } else {
            if (Object.keys(defaults).includes(variable.name)) {
                return `\t${variable.name} = ${defaultValue(variable.type, variable.cardinality, variable.name, defaults)}`;
            } else {
                return `\t${variable.name} = RandomData.newInstance {  }`;
            }
        }
    }).join(",\n");

}

function assertionList(variables, defaults) {
    if (variables.some((it) => it.example !== "")) {
        var assertions = variables.map((variable) => {
            if (variable.example !== "") {
                return `\tit.${variable.name} == ${renderVariable(variable.example, variable.type, variable.name, defaults)}`;
            } else if (variable.example === "" && defaults[variable.name]) {
                return `\tit.${variable.name} == ${renderVariable(defaults[variable.name], variable.type, variable.name, defaults)}`;
            }
        }).join("&&");
        return `.matching { ${assertions} }`;
    } else {
        return ""
    }


}

