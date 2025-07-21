/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var {findSlice, buildLink, findSliceByCommandId, findSliceByReadModelId} = require('../../common/util/config')
var slugify = require('slugify')
var {
    _screenTitle,
    _sliceTitle,
    _commandTitle,
    _readmodelTitle
} = require('../../common/util/naming')
var {capitalizeFirstCharacter, uniqBy, uniq} = require('../../common/util/util')
const {
    variables,
} = require("../common/domain");
const {parseSchema} = require("../../common/util/jsonschema");


let config = {}


module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");

    }


    writeScreens() {
        var slices = this.givenAnswers.slices
        slices.forEach((slice) => {
            this._writeScreen(slice)
        });
    }

    _writeBase64Image(base64Data, index) {
        try {
            // Remove data URL prefix if present (e.g., "data:image/png;base64,")
            const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

            // Convert base64 to buffer
            return Buffer.from(base64String, 'base64');
        } catch (error) {
            this.log(`✗ Error writing screen image ${index + 1}: ${error.message}`);
        }
    }

    _idAttribute(element) {
        return element.fields?.find(it => it.idAttribute)?.name ?? "aggregateId"
    }


    _writeScreen(sliceName) {
        var slice = findSlice(config, sliceName)
        var screens = this._findScreensForSlice(slice)

        screens.forEach((screen) => {

            var title = _screenTitle(screen.title)

            var commands = uniqBy(screen?.dependencies?.filter(dep => dep.type === "OUTBOUND").filter(it => it.elementType === "COMMAND").map((it) => {
                return config.slices.flatMap(item => item.commands).find(item => item.id === it.id)
            }).filter(it => it), (it) => it.id)

            var readModels = uniq(screen?.dependencies?.filter(dep => dep.type === "INBOUND").filter(it => it.elementType === "READMODEL").map((it) => {
                return config.slices.flatMap(item => item.readmodels).find(item => item.id === it.id)
            }).filter(it => it), (it) => it.id)

            commands.forEach((command) => {
                this._writeCommand(slice, command)
                this._writeCommandSchema(slice, command)
            })
            readModels.forEach((readModel) => {
                this._writeReadModel(slice, readModel)
            })

            var schemaImports = commands.map(command => `import ${_commandTitle(command.title)}Schema from './${_commandTitle(command.title)}.json'`).join("\n")


            var readModelImports = readModels.map(readModel => `import ${_readmodelTitle(readModel.title)} from './${_readmodelTitle(readModel.title)}'`).join("\n")


            var commandMapping = `[${commands.map((command) => {
                var commandSlice = findSliceByCommandId(config, command.id)
                var idAttribute = this._idAttribute(command)
                return `{
                    "command":"${_commandTitle(command.title)}",
                    "endpoint": ${command.apiEndpoint ? `"${command.apiEndpoint}/${idAttribute}"` : `"/${_sliceTitle(commandSlice.title)}/{${idAttribute}}"`},
                    "schema": ${_commandTitle(command.title) + "Schema"}
                }`
            }).join(",")}]`

            var readModelMapping = `[${readModels.map((readModel) => {
                return `{
                                "readModel":"${_readmodelTitle(readModel.title)}",
                                "endpoint": "${this._readModelEndpoint(sliceName, readModel)}" ,
                                "readModelView" : ${_readmodelTitle(readModel.title)}
                                
                            }`
            }).join(",")}]`

            const ai_readmodel_comment = `
            Read Model enabled: ${readModels.length > 0}
            ${readModels.map(readModel => `
            ## start read model
            Title: ${readModel.title}
            GET Endpoint: http://localhost:8080/${this._readModelEndpoint(sliceName, readModel)}
            Schema: ${JSON.stringify(parseSchema(readModel))}
            ## end read model
            `
            )}`

            const ai_command_comment = `
            Command enabled: ${commands.length > 0}
            ${commands?.map(command => `
            ## start command
            Title: ${command.title}
            POST Endpoint: http://localhost:8080/${command.apiEndpoint ? `"${command.apiEndpoint}/${this._idAttribute(command)}"` : `"/${_sliceTitle(command.slice)}/{${this._idAttribute(command)}}"`}
            Schema: ${JSON.stringify(parseSchema(command))}
            ## end command
            `
            )}
            
            
            `

            let screenImages = config.sliceImages?.filter(it => it.slice === sliceName)

            for (let screenImage of screenImages) {
                let buffer = this._writeBase64Image(screenImage.base64Image, screenImages.indexOf(screenImage))

                // Write to destination
                this.fs.write(
                    `${slugify(this.givenAnswers?.appName)}/app/components/slices/${_sliceTitle(slice.title)}/${screenImage.title}-${screenImage.id}.png`, buffer
                );
            }

            this.fs.copyTpl(
                this.templatePath('page.tsx.tpl'),
                this.destinationPath(`${slugify(this.givenAnswers?.appName)}/app/components/slices/${_sliceTitle(slice.title)}/${title}.tsx`),
                {
                    _name: title,
                    _pageName: capitalizeFirstCharacter(title),
                    _commands: commands.map((it) => `"${_sliceTitle(sliceName)}/${_commandTitle(it.title)}"`).join(","),
                    _schemaImports: schemaImports,
                    _commandMapping: commandMapping,
                    _readModelMapping: readModelMapping,
                    _readModelImports: readModelImports,
                    _ai_command_comment: ai_command_comment,
                    _ai_readmodel_comment: ai_readmodel_comment

                }
            )
        })


    }

    _writeCommands(slice) {
        var commands = slice?.commands
        if (!commands || commands.length == 0) {
            return
        }
        commands.filter(command => command).forEach((command) => {
            this._writeCommand(slice, command)
            this._writeCommandSchema(slice, command)
        })
    }

    _writeReadModels(slice) {
        var readModels = slice?.readmodels
        if (!readModels || readModels.length == 0) {
            return
        }
        readModels.filter(readModel => readModel).forEach((readModel) => {
            this._writeCommand(slice, readModel)
        })
    }

    _writeCommandSchema(slice, command) {
        this.fs.copyTpl(
            this.templatePath(`schema.json.tpl`),
            this.destinationPath(`${slugify(this.givenAnswers?.appName)}/app/components/slices/${_sliceTitle(slice.title)}/${_commandTitle(command?.title)}.json`),
            {
                _schema: JSON.stringify(parseSchema(command), null, 2)
            }
        )
    }

    _writeCommand(slice, command) {


        this.fs.copyTpl(
            this.templatePath(`command.ts.tpl`),
            this.destinationPath(`${slugify(this.givenAnswers?.appName)}/app/components/slices/${_sliceTitle(slice.title)}/${_commandTitle(command?.title)}.ts`),
            {
                _commandName: _commandTitle(command.title),
                _commandFields: variables([command]),
            }
        )


    }

    _writeReadModel(slice, readModel) {
        this.fs.copyTpl(
            this.templatePath(`readmodel.ts.tpl`),
            this.destinationPath(`${slugify(this.givenAnswers?.appName)}/app/components/slices/${_sliceTitle(slice.title)}/${_readmodelTitle(readModel?.title)}.tsx`),
            {
                _readModelName: _readmodelTitle(readModel.title),
                _endpoint: this._readModelEndpoint(slice.title, readModel)
            }
        )


    }

    _readModelEndpoint(sliceName, readModel) {
        var slice = findSliceByReadModelId(config, readModel.id)
        var idAttribute = readModel.fields?.find(it => it.idAttribute)?.name ?? "aggregateId"
        return readModel.apiEndpoint ? readModel.apiEndpoint : `${readModel.listElement ? "/" + _sliceTitle(slice.title) : "/" + _sliceTitle(slice.title) + `/{${idAttribute}}`}`
    }

    _findScreensForSlice(slice) {
        var screens = slice.screens

        var outboundScreens = slice.readmodels.flatMap(it => it.dependencies).filter(it => it.type === "OUTBOUND" && it.elementType === "SCREEN").map(it => config.slices.flatMap(it => it.screens).find(item => item.id === it.id))
        var allScreens = screens.concat(outboundScreens).filter(it => it)

        return uniqBy(allScreens, (it) => it.id)
    }

}
