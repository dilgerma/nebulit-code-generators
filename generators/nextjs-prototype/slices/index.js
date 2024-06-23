var Generator = require('yeoman-generator');
var {findSlice, buildLink, findSliceByCommandId} = require('../../common/util/config')
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


    _writeScreen(sliceName) {
        var slice = findSlice(config, sliceName)
        var screens = this._findScreensForSlice(slice)

        screens.forEach((screen) => {

            var title = _screenTitle(screen.title)

            var commands = uniqBy(screen?.dependencies?.filter(dep => dep.type === "OUTBOUND").filter(it => it.elementType === "COMMAND").map((it) => {
                return config.slices.flatMap(item => item.commands).find(item => item.id === it.id)
            }), (it)=>it.id)

            var readModels = uniq(screen?.dependencies?.filter(dep => dep.type === "INBOUND").filter(it => it.elementType === "READMODEL").map((it) => {
                return config.slices.flatMap(item => item.readmodels).find(item => item.id === it.id)
            }),(it)=>it.id)

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
                return `{
                    "command":"${_commandTitle(command.title)}",
                    "endpoint": "/${_sliceTitle(commandSlice.title)}/{aggregateId}",
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
                    _readModelImports: readModelImports

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
        return `${readModel.listElement ? "/" + _sliceTitle(sliceName) : "/" + _sliceTitle(sliceName) + "/{aggregateId}"}`
    }

    _findScreensForSlice(slice) {
        var screens = slice.screens

        var outboundScreens = slice.readmodels.flatMap(it => it.dependencies).filter(it => it.type === "OUTBOUND" && it.elementType === "SCREEN").map(it => config.slices.flatMap(it => it.screens).find(item => item.id === it.id))
        var allScreens = screens.concat(outboundScreens).filter(it => it)

        return uniqBy(allScreens, (it)=>it.id)
    }

}
