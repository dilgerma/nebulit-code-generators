var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')
const {v4: uuidv4} = require('uuid');
const {_eventTitle, _readmodelTitle, _commandTitle, _aggregateTitle} = require("../../common/util/naming");
const {findSlice} = require("../../common/util/config");
const {lowercaseFirstCharacter} = require("../../common/util/util");


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
                    message: 'Which specification should be generated?',
                    choices: specsFromSlice
                }]);
        } else {
            this.log(chalk.blue('No Specifications defined!'))
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
            var when = specification.when?.[0] ?? []
            var then = specification.then

            var allElements = given.concat(when).concat(then);
            var allFields = allElements.flatMap((item) => item.fields)
            var _elementImports = generateImports(this.givenAnswers.rootPackageName, title, allElements)
            var _typeImports = typeImports(allFields)
            var aggregateId = uuidv4()
            var defaults = {
                "aggregateId": aggregateId
            }
            if (then.some(it => it.type === "SPEC_READMODEL")) {

                var events = given?.map(it => {
                    return config.slices.flatMap(it => it.events).find(item => item.id === it.linkedId)
                }).map(it => it)

                var readModel = then.find(it => it.type === "SPEC_READMODEL")


                var commands = events.flatMap(it => it.dependencies).filter(it => it.type === "INBOUND").filter(it => it.elementType === "COMMAND").map(it => config.slices.flatMap(item => item.commands).find(item => item.id === it.id)).filter(it => it)

                var _commandImports = this._commandImports(this.givenAnswers.rootPackageName, commands)
                var _queryImports = this._queryImports(title, this.givenAnswers.rootPackageName, _readmodelTitle(readModel.title))

                //for now only result events supported
                this.fs.copyTpl(
                    this.templatePath(`src/components/ReadModelSpecification.kt.tpl`),
                    this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/test/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${title}/integration/${specificationName}.kt`),
                    {
                        _slice: title,
                        _rootPackageName: this.givenAnswers.rootPackageName,
                        _name: specificationName,
                        _elementImports: _elementImports,
                        _commandImports: _commandImports,
                        _queryImports: _queryImports,
                        _typeImports: _typeImports,
                        _given: this._renderReadModelGiven(commands),
                        _then: this._renderReadModelThen(commands, then, defaults),
                        // take first aggregate
                        _aggregate: _aggregateTitle((slice.aggregates || [])[0]),
                        _aggregateId: aggregateId

                    }
                )
            } else {
                this.fs.copyTpl(
                    this.templatePath(`src/components/Specification.kt.tpl`),
                    this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/test/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${title}/${specificationName}.kt`),
                    {
                        _slice: title,
                        _rootPackageName: this.givenAnswers.rootPackageName,
                        _name: specificationName,
                        _elementImports: _elementImports,
                        _typeImports: _typeImports,
                        _given: renderGiven(given, defaults),
                        _when: renderWhen(when, then, defaults),
                        _then: renderThen(when, then, defaults),
                        _thenExpectations: renderThenExpectation(when, then, defaults),
                        // take first aggregate
                        _aggregate: _aggregateTitle((slice.aggregates || [])[0]),
                        _aggregateId: aggregateId

                    }
                )
            }
        })

    }

    _commandImports(rootPackage, commands) {
        return commands.map(it => `import ${rootPackage}.domain.commands.${_sliceTitle(this._findSliceByCommandId(it.id)?.title)}.${_commandTitle(it.title)}`).join("\n")
    }

    _queryImports(slice, rootPackage, readModel) {
        return `import ${rootPackage}.${slice}.${readModel}Query
 import ${rootPackage}.${slice}.${readModel}`
    }

    _renderReadModelGiven(commands) {

        return commands.map(it => `
       
        val aggregateId = UUID.randomUUID()
        
        var ${lowercaseFirstCharacter(_commandTitle(it.title))} = RandomData.newInstance<${_commandTitle(it.title)}>{
            this.aggregateId = aggregateId
        }
       
        var ${lowercaseFirstCharacter(_commandTitle(it.title))}Result = commandGateway.sendAndWait<CommandResult>(${lowercaseFirstCharacter(_commandTitle(it.title))})
        `).join("\n")
    }


    _renderReadModelThen(commands, then) {
        return then.map(it => `
        awaitUntilAssserted {
            var readModel = ${this._generateQuery(it)}
            ${commands.map(command => {
                return `assertThat(${lowercaseFirstCharacter(_commandTitle(command.title))}Result.identifier).isEqualTo(aggregateId)`
                
        }).join("\n")}
            TODO("implement condition")
        }
        `)
    }

    _generateQuery(readModel) {
        var readModelTitle = _readmodelTitle(readModel.title)
        if (readModel.listElement ?? false) {
            return `queryGateway.query(${readModelTitle}Query(), ${readModelTitle}::class.java)`
        } else {
            return `queryGateway.query(${readModelTitle}Query(aggregateId), ${readModelTitle}::class.java)`
        }
    }


    _findSlice(sliceName) {
        return config.slices.find((item) => item.title === sliceName)
    }

    _findSliceByCommandId(id) {
        return config.slices.filter(it => it.commands.some(item => item.id === id))[0]
    }


};


const generateImports = (rootPackageName, sliceName, elements) => {
    var imports = elements?.map((element) => {
        switch (element.type?.toLowerCase()) {
            case "spec_event":
                return `import ${rootPackageName}.events.${_eventTitle(element.title)}`
            case "spec_command":
                return `import ${rootPackageName}.domain.commands.${sliceName}.${_commandTitle(element.title)}`
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


function _specificationTitle(title) {
    var adjustedTitle = title.replace("Spec:", "").replace("-", "").trim()
    return `${slugify(capitalizeFirstCharacter(adjustedTitle), "")}Test`
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

function renderThenExpectation(when, thenList, defaults) {
    //in case no error render then
    var thens = thenList.map((item) => {

        if (item.type === "SPEC_EVENT") {
            return `
               expectedEvents.add(RandomData.newInstance<${_eventTitle(item.title)}> { 
               ${assertionList(item.fields, when.fields, defaults)}
                })   
                `
        }

    }).join("\n")

    if (thens?.length === 0 && !thenList.some((error) => error.type === "SPEC_ERROR")) {
        return "Assertions.fail<Unit>(\"No assertion defined in Model. Manual implementation required\")"
    }
    return thens
}

function renderThen(whenList, thenList, defaults) {

    if (thenList.some((error) => error.type === "SPEC_ERROR")) {
        // in case error render erro
        return `.expectException(CommandException::class.java)`
    } else {
        return `.expectSuccessfulHandlerExecution()
                .expectEvents(*expectedEvents.toTypedArray())`
    }
}


function renderWhen(whenCommand, thenList, defaults) {
    //only render when if no error occured
    return `val command = ${_commandTitle(whenCommand.title)}(
 \t\t\t\t${randomizedInvocationParamterList(whenCommand.fields, defaults)}
            )`

}

function renderGiven(givenList, defaults) {
    var givens = givenList.map((event) => {
        return `events.add(RandomData.newInstance<${_eventTitle(event.title)}> {
                        ${randomizedInvocationParamterList(event.fields.filter((it) => it.name == "aggregateId"), defaults)}
                    })`
    }).join("\n")

    var given = `
     ${givens}
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

function assertionList(variables, assignmentValues, defaults) {
    return variables.map((variable) => {
        // if example data provided, take the example into assertion
        if (variable.example !== "") {
            return `\tthis.${variable.name} = ${renderVariable(variable.example, variable.type, variable.name, defaults)}`;
            // take the value from the command if available
        } else if (assignmentValues?.some(field => field.name === variable.name)) {
            return `\tthis.${variable.name} = command.${variable.name}`;
        } else if (variable.example === "" && defaults[variable.name]) {
            // is there any default? take the default
            return `\tthis.${variable.name} = ${renderVariable(defaults[variable.name], variable.type, variable.name, defaults)}`;
        } else {
            return `//this.${variable.name} = ...`
        }
    }).filter(it => it).join("\n");
}

