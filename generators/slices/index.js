var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')
var config = require('./../../config.json')
const {answers} = require("../app");

function _sliceTitle(title) {
    return slugify(title.replace("slice:", "")).toLowerCase()
}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
    }

    async prompting() {
        this.answers = await this.prompt([
            {
                type: 'checkbox',
                name: 'slices',
                message: 'Welcher Slice soll generiert werden?',
                choices: config.slices.map((item) => item.title).sort()
            }]);
    }

    writePages() {
        this.answers.slices.forEach((slice) => {
            this._writePage(slice)
        });
    }

    _writePage(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _sliceTitle(slice.title).toLowerCase()
        this.fs.copyTpl(
            this.templatePath('src/pages/page.tsx'),
            this.destinationPath(`${this.givenAnswers?.appName}/src/pages/${title}.tsx`),
            {
                _name: title,
                _fields: FieldComponentGenerator.generateVariables(slice.commands),
                _state: FieldComponentGenerator.generateState(slice.commands),
                _commandTriggers: FieldComponentGenerator.generateCommandTrigger(slice, slice.commands),
                _imports: FieldComponentGenerator.generateSliceSpecificImports(slice, slice.commands),
                _handlerImports: FieldComponentGenerator.generateHandlerImports(slice, slice.commands),

            }
        )
    }

    writeCommandHandlers() {
        this.answers.slices.forEach((slice) => {
            this._writeCommandHandlers(slice)
        });
    }

    _writeCommandHandlers(sliceName) {

        var slice = this._findSlice(sliceName)
        var title = _sliceTitle(slice.title).toLowerCase()
        slice.commands?.filter((command) => command.title).forEach((command) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/commandhandler.ts.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/src/components/${title}/commands/${command.title}CommandHandler.ts`),
                {
                    _slice: title,
                    _name: command.title,
                    _eventInvocations: slice.events.map((event) => receiverInvocation(event, "command")).join("\n"),
                    _imports: FieldComponentGenerator.generateSliceSpecificImports(slice, slice.commands),
                    _globalImports: FieldComponentGenerator.generateGlobalImports(slice, slice.events),
                }
            )
        })

    }

    writeCommands() {
        this.answers.slices.forEach((slice) => {
            this._writeCommands(slice)
        });
    }

    _writeCommands(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _sliceTitle(slice.title).toLowerCase()

        slice.commands?.filter((command) => command.title).forEach((command) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/command.ts.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/src/components/${title}/commands/${command.title}.ts`),
                {
                    _name: command.title,
                    _constructor: ConstructorGenerator.generateConstructor(
                        command.fields
                    )
                }
            )
        })


    }

    writeEvents() {
           this.answers.slices.forEach((slice) => {
               this._writeEvents(slice)
           });
       }

    _writeEvents(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _sliceTitle(slice.title).toLowerCase()

        slice.events?.filter((event) => event.title).forEach((event) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/event.ts.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/src/components/events/${event.title}.ts`),
                {
                    _name: event.title,
                    _constructor: ConstructorGenerator.generateConstructor(
                        event.fields
                    )
                }
            )
        })

    }

    writeReadModels() {
              this.answers.slices.forEach((slice) => {
                  this._writeReadModels(slice)
              });
          }

    _writeReadModels(sliceName) {
        var slice = this._findSlice(sliceName)

        var title = _sliceTitle(slice.title).toLowerCase()

        slice.readmodels?.filter((readmodel) => readmodel.title).forEach((readmodel) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/readmodel.ts.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/src/components/${title}/readmodels/${readmodel.title}.ts`),
                {
                    _name: readmodel.title,
                    _variables: VariablesGenerator.generateVariables(
                        readmodel?.fields
                    )
                }
            )
        })


    }

    end() {
        this.log(chalk.green('------------'))
        this.log(chalk.blue('Jobs Commands is Done!'))
        this.log(chalk.green('------------'))
    }

    _findSlice(sliceName) {
        return config.slices.find((item) => item.title === sliceName)
    }

};


class ConstructorGenerator {

//(: {name, type, example, mapping}
    static generateConstructor(fields) {
        return `constructor(${fields?.map((field) => "public readonly " + field.name + ":" + typeMapping(field.type)).join(",")}) {}`
    }
}

class VariablesGenerator {

//(: {name, type, example, mapping}
    static generateVariables(fields) {
        return fields?.map((variable) => {
            return `\t${variable.name}:${typeMapping(variable.type, variable.cardinality)};`
        }).join("\n")
    }
}

class FieldComponentGenerator {

    static generateState(commands) {
        return commands?.map((variable) => {
            return variable.fields.map((field) => {

                //var typeMapping = typeMapping(variable.type, variable.cardinality)
                return `\tconst [${field.name}, ${toCamelCase("set", field.name)}] = useState<${typeMapping(field.type, field.cardinality)}>(${defaultValue(field.type, field.cardinality)})`
            }).filter((it) => it !== undefined).join("\n")
        })
    }


}

const invocation = (type, fields) => {
    return `new ${type}(${fields.map((it) => variableNameOrMapping(it)).join(",")})`
}

const receiverInvocation = (type, receiver) => {
    return `new ${type.title}(${type.fields.map((it) => receiver + "." + variableNameOrMapping(it)).join(",")})`
}

const variableNameOrMapping = (field) => {
    return (field.mapping && field.mapping!=="") ? field.mapping : field.name
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
