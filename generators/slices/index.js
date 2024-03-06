var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')
var config = require('./../../config.json')
const {answers} = require("../app");
const {givenAnswers} = require("./index");

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
                message: 'Welche Slices soll generiert werden?',
                choices: config.slices.map((item,idx) => item.title).sort()
            }]);

    }

    // writePages() {
    //     this.answers.slices.forEach((slice) => {
    //         this._writePage(slice)
    //     });
    // }

    // _writePage(sliceName) {
    //     var slice = this._findSlice(sliceName)
    //     var title = _sliceTitle(slice.title).toLowerCase()
    //     this.fs.copyTpl(
    //         this.templatePath('src/pages/page.tsx'),
    //         this.destinationPath(`${this.givenAnswers?.appName}/src/pages/${title}.tsx`),
    //         {
    //             _name: title,
    //             _fields: FieldComponentGenerator.generateVariables(slice.commands),
    //             _state: FieldComponentGenerator.generateState(slice.commands),
    //             _commandTriggers: FieldComponentGenerator.generateCommandTrigger(slice, slice.commands),
    //             _imports: FieldComponentGenerator.generateSliceSpecificImports(slice, slice.commands),
    //             _handlerImports: FieldComponentGenerator.generateHandlerImports(slice, slice.commands),
    //
    //         }
    //     )
    // }

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
                this.templatePath(`src/components/CommandHandler.kt.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/slices/${title}/${command.title}CommandHandler.kt`),
                {
                    _slice: title,
                    _commandType: this._commandTitle(command.title),
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: this._commandTitle(command.title)
                }
            )
        })

    }

    writeCommands() {
        this.log(chalk.green(JSON.stringify(this.answers)))

        this.answers.slices.forEach((slice) => {
            this._writeCommands(slice)
        });
    }

    _writeCommands(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _sliceTitle(slice.title).toLowerCase()


        slice.commands?.filter((command) => command.title).forEach((command) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/Command.kt.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/slices/${title}/${this._commandTitle(command.title)}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: this._commandTitle(command.title),
                    _fields: ConstructorGenerator.generateConstructorVariables(
                        command.fields
                    )
                }
            )
        })


    }

    // writeEvents() {
    //        this.answers.slices.forEach((slice) => {
    //            this._writeEvents(slice)
    //        });
    //    }
    //
    // _writeEvents(sliceName) {
    //     var slice = this._findSlice(sliceName)
    //     var title = _sliceTitle(slice.title).toLowerCase()
    //
    //     slice.events?.filter((event) => event.title).forEach((event) => {
    //         this.fs.copyTpl(
    //             this.templatePath(`src/components/event.ts.tpl`),
    //             this.destinationPath(`${this.givenAnswers?.appName}/src/components/events/${event.title}.ts`),
    //             {
    //                 _name: event.title,
    //                 _constructor: ConstructorGenerator.generateConstructorVariables(
    //                     event.fields
    //                 )
    //             }
    //         )
    //     })
    //
    // }

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
                    this.templatePath(`src/components/ReadModel.kt.tpl`),
                    this.destinationPath(`${this.givenAnswers?.appName}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/slices/${title}/${this._readmodelTitle(readmodel.title)}.kt`),
                    {
                        _slice: title,
                        _rootPackageName: this.givenAnswers.rootPackageName,
                        _name: this._readmodelTitle(readmodel.title),
                        _fields: VariablesGenerator.generateVariables(
                            readmodel.fields
                        )
                    }
                )
            })


        }

    _commandTitle(title) {
        return `${capitalizeFirstCharacter(title)}Command`
    }
    _readmodelTitle(title) {
           return `${capitalizeFirstCharacter(title)}ReadModel`
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
    static generateConstructorVariables(fields) {
        return `${fields?.map((field) => "var " + field.name + ":" + typeMapping(field.type)).join(",")}`
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
}

const typeMapping = (fieldType, fieldCardinality)=>{
    var fieldType;
    switch (fieldType?.toLowerCase()) {
        case "string": fieldType = "String";break
        case "double": fieldType = "Double";break
        case "long": fieldType="Long";break
        case "boolean": fieldType = "Boolean";break
        default: fieldType = "String";break
    }
    if (fieldCardinality?.toLowerCase() === "list") {
        return `List<${fieldType}>`
    } else {
        return fieldType
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
