/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')
const {answers} = require("../app");
const {
    _eventTitle,
    _commandTitle,
    _processorTitle,
    _readmodelTitle,
    _sliceTitle,
    _aggregateTitle,
    _restResourceTitle
} = require("./../../../generators/common/util/naming");
const {variableAssignments, processSourceMapping} = require("../../common/util/variables");
const {ClassesGenerator, typeMapping, typeImports, idType} = require("../../common/util/generator");
const {_sliceSpecificClassTitle, _packageName, _packageFolderName} = require("../../common/util/naming");
const {camelCaseToUnderscores, idField} = require("../../common/util/util");


let config = {}


module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");

    }

    async prompting() {
        this.answers = await this.prompt([
            {
                type: 'checkbox',
                name: 'slice',
                loop: false,
                message: 'Choose Slices to generate?',
                choices: (items) => config.slices.filter((slice) => !items.context || items.context?.length === 0 || items.context?.includes(slice.context)).map((item, idx) => item.title).sort(),
                when: (answers) => !answers.allSlices
            },
            {
                type: 'checkbox',
                name: 'liveReportModels',
                message: 'Which ReadModels should read directly from the Eventstream?',
                when: (input) => {return input.slice?.length == 1 && config.slices.find((slice) => slice.title === input.slice[0])?.readmodels?.length > 0},
                choices: (items) => config.slices.filter((slice) => !items.context || items.context?.length === 0 || items.context?.includes(slice.context)).filter((item) => item.title === items.slice[0]).flatMap((slice) => slice.readmodels).map(item => item.title)
            },
            {
                type: 'checkbox',
                name: 'processTriggers',
                message: 'Which event triggers the Automation?',
                when: (input) => input.slice.length === 1 && (this._findTriggerEvents(input)?.length > 0),
                choices: (items) => this._findTriggerEvents(items)
            }])

    }

    _findTriggerEvents(items) {
        var slice = config.slices.filter((slice) => !items.context || items.context?.length === 0 || items.context?.includes(slice.context)).filter((item) => item.title === items.slice[0])[0]
        if (!slice) {
            return []
        }

        var processor = slice.processors[0]
        if (!processor) {
            return []
        }

        var inboundDepIds = processor.dependencies.filter((dep) => dep.type === "INBOUND" && dep.elementType === "READMODEL").map(it => it.id)

        var readModels = config.slices.flatMap((slice) => slice.readmodels).filter((readmodel) => inboundDepIds.includes(readmodel.id))

        var events = readModels.flatMap(it => it.dependencies.filter(dep => dep.type === "INBOUND" && dep.elementType === "EVENT")).map(it => it.title)

        return events
    }

    writeSlice() {

        if (this.answers.slice.length === 0)
            return
        if (this.answers.slice.length > 1) {
            this.answers.slice.forEach(slice => this._writeSingleSlice(slice))
        } else {
            this._writeSingleSlice(this.answers.slice[0])
        }


    }

    _writeSingleSlice(slice) {
        var sliceName = slice
        this._writeReadme(sliceName)
        this._writeCommands(sliceName);
        this._writeEvents(sliceName)
        this._writeReadModels(sliceName)
        this._writeRestControllers(sliceName)
        this.composeWith(require.resolve('../specifications'), {
            answers: {...this.answers, ...this.givenAnswers, slice: sliceName},
            appName: this.answers.appName ?? this.appName
        });
        this._writeProcessors(sliceName)

    }

    _writeReadme(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()


        this.fs.copyTpl(
            this.templatePath(`src/components/README.md.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${title}/README.md`),
            {
                _name: slice.title,
                _link: boardlLink(config.boardId, slice.id)
            }
        )

    }

    _writeCommands(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()


        slice.commands?.filter((command) => command.title).forEach((command) => {

            this.fs.copyTpl(
                this.templatePath(`src/components/package-info.java.tpl`),
                this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/domain/commands/${title}/package-info.java`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _packageName: _packageName(this.givenAnswers.rootPackageName, config?.codeGen?.contextPackage, false),
                    link: boardlLink(config.boardId, command.id)
                }
            )


            this.fs.copyTpl(
                this.templatePath(`src/components/Command.kt.tpl`),
                this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config?.codeGen?.contextPackage, false)}/domain/commands/${title}/${_commandTitle(command.title)}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _packageName: _packageName(this.givenAnswers.rootPackageName, config?.codeGen?.contextPackage, false),
                    _name: _commandTitle(command.title),
                    _fields: ConstructorGenerator.generateCommandConstructorVariables(
                        command.fields,
                        [],
                        idField(command)??"aggregateId"
                    ),
                    link: boardlLink(config.boardId, command.id),
                    _typeImports: typeImports(command.fields)

                }
            )
        })


    }


    _writeEvents(sliceName, eventFilter = []) {

        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()

        slice.events?.filter((event) => event.title)
            .filter((event) => {
                return !eventFilter || eventFilter.length === 0 || eventFilter.includes(event.title)
            })
            .filter(event => event.context !== "EXTERNAL")
            .forEach((event) => {

                this.fs.copyTpl(
                    this.templatePath(`src/components/Event.kt.tpl`),
                    this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, null, false)}/events/${_eventTitle(event.title)}.kt`),
                    {
                        _slice: title,
                        _rootPackageName: this.givenAnswers.rootPackageName,
                        _packageName: _packageName(this.givenAnswers.rootPackageName, null, false),
                        _name: _eventTitle(event.title),
                        _fields: ConstructorGenerator.generateConstructorVariables(
                            event.fields
                        ),
                        //for now take first aggregate
                        _aggregate: _aggregateTitle((event.aggregateDependencies || ["AGGREGATE"])[0]),
                        _typeImports: typeImports(event.fields),
                        link: boardlLink(config.boardId, event.id),

                    }
                )
            })


    }


    _writeReadModels(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()

        slice.readmodels?.filter((readmodel) => readmodel.title).forEach((readmodel) => {


            let liveReport = this.answers.liveReportModels?.includes(readmodel.title)

            let sliceEvents = config.slices.flatMap(it => it.events)
            let inboundEvents = readmodel.dependencies?.filter(it => it.type === "INBOUND").filter(it => it.elementType === "EVENT").map(it => sliceEvents.find(sliceEvent => it.id === sliceEvent.id)).filter(it => it)

            let idAttributes = readmodel.fields.filter(it => it.idAttribute)

            if (liveReport) {
                this._writeLiveReportReadModel(title, readmodel, inboundEvents)
            } else {
                if (idAttributes.length <= 1) {
                    this._writeQueryableReportReadModel(title, readmodel, inboundEvents)
                } else {
                    this._writeQueryableMultiKeyReportReadModel(title, readmodel, inboundEvents)
                }
            }

            var eventDeps = readmodel.dependencies.filter(it => it.type === "INBOUND" && it.elementType === "EVENT")
            var events = config.slices.flatMap(slice => slice.events).filter(event => eventDeps.map(it => it.id).includes(event.id))
            events.forEach(event => {
                this._writeEvents(event.slice, [event.title])
            })
        })

    }

    _repositoryQuery(readModel) {
        var idField = readModel.fields?.find(it => it.idAttribute)?.name??"aggregateId"
        if (readModel.listElement ?? false) {
            return `return ${_readmodelTitle(readModel.title)}(repository.findAll())`
        } else {
            return `
            if(!repository.existsById(query.${idField})) {
                return null
            }
            return ${_readmodelTitle(readModel.title)}(repository.findById(query.${idField}).get())`
        }
    }

    _writeLiveReportReadModel(slice, readmodel, inboundEvents) {
        if (readmodel.listElement) {

            this.fs.copyTpl(
                this.templatePath(`src/components/LiveReportListReadModel.kt.tpl`),
                this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/${_readmodelTitle(readmodel.title)}.kt`),
                {
                    _slice: slice,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                    _name: _readmodelTitle(readmodel.title),
                    _fields: ConstructorGenerator.generateConstructorVariables(
                        readmodel.fields
                    ),
                    //for now take first aggregate
                    _aggregate: _aggregateTitle((readmodel.aggregateDependencies || ["AGGREGATE"])[0]),
                    _eventsImports: this._eventsImports(inboundEvents.map(it => it.title)),

                    _eventLoop: _renderReadModelSwitchCase(readmodel, inboundEvents),

                    _typeImports: typeImports(readmodel.fields),
                    link: boardlLink(config.boardId, readmodel.id),
                }
            )
        } else {
            this.fs.copyTpl(
                this.templatePath(`src/components/LiveReportReadModel.kt.tpl`),
                this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/${_readmodelTitle(readmodel.title)}.kt`),
                {
                    _slice: slice,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                    _name: _readmodelTitle(readmodel.title),
                    _fields: VariablesGenerator.generateLiveReportVariables(
                        readmodel.fields
                    ),
                    //for now take first aggregate
                    _aggregate: _aggregateTitle((readmodel.aggregateDependencies || ["AGGREGATE"])[0]),
                    _eventsImports: this._eventsImports(inboundEvents.map(it => it.title)),

                    _eventLoop: _renderReadModelSwitchCase(readmodel, inboundEvents),

                    _typeImports: typeImports(readmodel.fields),
                    link: boardlLink(config.boardId, readmodel.id),
                }
            )
        }

        this.fs.copyTpl(
            this.templatePath(`src/components/LiveReportQueryHandler.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/internal/${_readmodelTitle(readmodel.title)}QueryHandler.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: _readmodelTitle(readmodel.title),
                _typeImports: typeImports(readmodel.fields),
                link: boardlLink(config.boardId, readmodel.id),
            }
        )
    }

    _readModelQueryElement(readModel) {
        var idField = readModel.fields?.find(it => it.idAttribute)
        var idFieldName = idField?.name ?? "aggregateId"
        var idType = idField ? typeMapping(idField?.type,idField?.cardinality,idField?.optional, idField?.mutable) : "UUID"

        if (readModel.listElement ?? false) {
            return `class ${_readmodelTitle(readModel.title)}Query()`
        } else {
            return `data class ${_readmodelTitle(readModel.title)}Query(val ${idFieldName}:${idType})
`
        }
    }

    _writeQueryableMultiKeyReportReadModel(slice, readModel, inboundEvents) {

        this.fs.copyTpl(
            this.templatePath(`src/components/QueryableMultiKeyReadModelProjector.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/internal/${_readmodelTitle(readModel.title)}Projector.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: _readmodelTitle(readModel.title),
                _fields: VariablesGenerator.generateVariables(
                    readModel.fields
                ),
                //for now take first aggregate
                _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),
                _eventsImports: this._eventsImports(inboundEvents.map(it => it?.title)),
                _eventHandlers: this._renderMultiKeyEventHandlers(readModel, inboundEvents),

                //no UUID, as this is fixed in the Projector
                _typeImports: typeImports(readModel.fields, "import java.util.UUID"),
                link: boardlLink(config.boardId, readModel.id),
            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/QueryableMultiKeyReadModelQueryHandler.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/internal/${_readmodelTitle(readModel.title)}QueryHandler.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: _readmodelTitle(readModel.title),
                //for now take first aggregate
                _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),
                _query: this._repositoryQuery(readModel),
                _typeImports: typeImports(readModel.fields),
                _fields: VariablesGenerator.generateInvocation(readModel.fields.filter(it => it.idAttribute), "query"),
                link: boardlLink(config.boardId, readModel.id),
            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/QueryableMultiKeyReadModel.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/${_readmodelTitle(readModel.title)}.kt`),
            {
                _slice: slice,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _rootPackageName: this.givenAnswers.rootPackageName,
                _typeImports: typeImports(readModel.fields),
                _name: _readmodelTitle(readModel.title),
                _data: this._readModelData(readModel),
                _keyFields: this._keyFields(readModel, false),
                _annotatedKeyFields: this._keyFields(readModel, true),
                _entityFields: VariablesGenerator.generateEntityVariables(
                    slice,
                    readModel.fields,
                    readModel?.fields.find(it => it?.idAttribute).name??"aggregateId"
                ),
                _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),
                link: boardlLink(config.boardId, readModel.id),
            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/ReadOnlyRestResource.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/internal/ReadOnly${_restResourceTitle(readModel.title)}.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: slice,
                _readModel: _readmodelTitle(readModel.title),
                _controller: capitalizeFirstCharacter(slice),
                _typeImports: typeImports(readModel.fields),
                _endpoint: this._generateGetRestCall(slice, VariablesGenerator.generateRestParamInvocation(
                    //only provide aggregateId (so that proper imports are generated)
                    readModel.fields?.filter(item => item.name === "aggregateId")
                ), readModel, readModel.apiEndpoint),
                link: boardlLink(config.boardId, readModel.id),
            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/ReadOnlyRestResource.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/internal/ReadOnly${_restResourceTitle(readModel.title)}.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: slice,
                _readModel: _readmodelTitle(readModel.title),
                _controller: capitalizeFirstCharacter(slice),
                _typeImports: typeImports(readModel.fields),
                _endpoint: this._generateGetRestCall(slice, VariablesGenerator.generateRestParamInvocation(
                    readModel.fields
                ), readModel, readModel.apiEndpoint),
                link: boardlLink(config.boardId, readModel.id),
            }
        )
    }

    _keyFields(readModel) {
        return ConstructorGenerator.generateConstructorVariables(readModel.fields?.filter(it => it.idAttribute))
    }

    _writeQueryableReportReadModel(slice, readModel, inboundEvents) {

        this.fs.copyTpl(
            this.templatePath(`src/components/QueryableReadModelProjector.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/internal/${_readmodelTitle(readModel.title)}Projector.kt`),
            {
                _slice: slice,
                _idType: idType(readModel),
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: _readmodelTitle(readModel.title),
                _fields: VariablesGenerator.generateVariables(
                    readModel.fields
                ),
                //for now take first aggregate
                _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),
                _eventsImports: this._eventsImports(inboundEvents.map(it => it?.title)),
                _eventHandlers: this._renderEventHandlers(readModel, inboundEvents),

                //no UUID, as this is fixed in the Projector
                _typeImports: typeImports(readModel.fields, "import java.util.UUID"),
                link: boardlLink(config.boardId, readModel.id),
            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/QueryableReadModelQueryHandler.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/internal/${_readmodelTitle(readModel.title)}QueryHandler.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: _readmodelTitle(readModel.title),
                //for now take first aggregate
                _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),
                _query: this._repositoryQuery(readModel),
                _typeImports: typeImports(readModel.fields),
                link: boardlLink(config.boardId, readModel.id),

            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/QueryableReadModel.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/${_readmodelTitle(readModel.title)}.kt`),
            {
                _slice: slice,
                _data: this._readModelData(readModel),
                _queryElement: this._readModelQueryElement(readModel),
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: _readmodelTitle(readModel.title),
                //for now take first aggregate
                _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),

                _entityFields: VariablesGenerator.generateEntityVariables(
                    slice,
                    readModel.fields,
                    readModel.fields?.find(it => it.idAttribute)?.name??"aggregateId"
                ),
                _typeImports: typeImports(readModel.fields),
                link: boardlLink(config.boardId, readModel.id),
            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/ReadOnlyRestResource.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${slice}/internal/ReadOnly${_restResourceTitle(readModel.title)}.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                _name: slice,
                _readModel: _readmodelTitle(readModel.title),
                _controller: capitalizeFirstCharacter(slice),
                _typeImports: typeImports(readModel.fields),
                _endpoint: this._generateGetRestCall(slice, VariablesGenerator.generateRestParamInvocation(
                    readModel.fields
                ), readModel, readModel.apiEndpoint),
                link: boardlLink(config.boardId, readModel.id),
            }
        )
    }

    _renderMultiKeyEventHandlers(readModel, events) {
        var readModelTitle = _readmodelTitle(readModel.title)
        var readModelIdFields = readModel.fields.filter(it => it.idAttribute)
        return events.map(it => {
            return `
@EventHandler
fun on(event: ${_eventTitle(it.title)}) {
    //throws exception if not available (adjust logic)
    val entity = this.repository.findById(${readModelTitle}Key(${VariablesGenerator.generateInvocation(readModelIdFields, "event")})).orElse(${_readmodelTitle(readModel.title)}Entity())
    entity.apply {
        ${variableAssignments(readModel.fields, "event", it, "\n")}
    }.also { this.repository.save(it) }
}`
        }).join("\n")
    }

    _renderEventHandlers(readModel, events) {
        return events.map(it => {
            return `
@EventHandler
fun on(event: ${_eventTitle(it.title)}) {
    //throws exception if not available (adjust logic)
    val entity = this.repository.findById(event.${idField(readModel)}).orElse(${_readmodelTitle(readModel.title)}Entity())
    entity.apply {
        ${variableAssignments(readModel.fields, "event", it, "\n")}
    }.also { this.repository.save(it) }
}`
        }).join("\n")
    }

    _writeRestControllers(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()


        slice.commands?.filter((command) => command.title).forEach((command) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/RestResource.kt.tpl`),
                this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${title}/internal/${_restResourceTitle(command.title)}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                    _name: title,
                    _command: _commandTitle(command.title),
                    _controller: _restResourceTitle(command.title),
                    _typeImports: typeImports(command.fields),
                    _debugendpoint: this._generateDebugPostRestCall(title, VariablesGenerator.generateRestParamInvocation(
                        command.fields
                    ), _commandTitle(command.title), VariablesGenerator.generateInvocation(
                        command.fields
                    ), command.apiEndpoint),
                    _payload: ClassesGenerator.generateDataClass(_sliceSpecificClassTitle(sliceName, "Payload"), command.fields),
                    _endpoint: this._generatePostRestCall(slice.title, _commandTitle(command.title),
                        variableAssignments(command.fields, "payload", command, ",\n", "="), command.apiEndpoint),
                    link: boardlLink(config.boardId, command.id),
                }
            )
        })

    }

    _readModelData(readModel) {
        if (readModel?.listElement) {
            return `val data: List<${_readmodelTitle(readModel.title)}Entity>`
        } else {
            return `val data: ${_readmodelTitle(readModel.title)}Entity`
        }
    }

    _generateDebugPostRestCall(slice, restVariables, command, variables, endpoint) {
        return `
    @CrossOrigin
    @PostMapping(${endpoint ? `\"/debug${endpoint?.startsWith("/") ? endpoint : "/" + endpoint}\"` : `\"/debug/${slice}\"`})
    fun processDebugCommand(${restVariables}):CompletableFuture<Any> {
        return commandGateway.send(${command}(${variables}))
    }
    `
    }

    _generatePostRestCall(slice, command, variableAssignments, endpoint) {
        return `
       @CrossOrigin
       @PostMapping(${endpoint ? `"${endpoint}/{id}"`
            : `"/${_sliceTitle(slice)}/{id}"`})
    fun processCommand(
        @PathVariable("id") ${idField(command)}: ${idType(command)},
        @RequestBody payload: ${_sliceSpecificClassTitle(slice, "Payload")}
    ):CompletableFuture<Any> {
         return commandGateway.send(${command}(${variableAssignments}))
        }
       `
    }

    _generateQuery(slice, readModel) {
        var readModelTitle = _readmodelTitle(readModel.title)
        var idAttributes = readModel.fields?.filter(it => it.idAttribute)

        if (readModel.listElement ?? false) {
            return `queryGateway.query(${readModelTitle}Query(), ${readModelTitle}::class.java)`
        } else {
            if (idAttributes.length <= 1) {
                return `queryGateway.query(${readModelTitle}Query(${idField(readModel)}), ${readModelTitle}::class.java)`;
            } else {
                return `queryGateway.query(${readModelTitle}Query(${VariablesGenerator.generateInvocation(idAttributes)}), ${readModelTitle}::class.java)`;
            }
        }
    }

    _generateGetRestCall(slice, restVariables, readModel, endpoint) {
        var readModelTitle = _readmodelTitle(readModel.title)
        var readModelIdAttributes = readModel.fields.filter(it => it.idAttribute)
        if (readModel.listElement) {
            return `@GetMapping(${endpoint ? `"${endpoint}"` : `"/${slice}"`})
                    fun findReadModel():CompletableFuture<${readModelTitle}> {
                         return ${this._generateQuery(slice, readModel)}  
                    }`
        } else {
            if(readModelIdAttributes.length <= 1) {
                return `@GetMapping(${endpoint ? `"${endpoint}/{id}"` : `"/${slice}/{id}"`})
                      fun findReadModel(@PathVariable("id") ${idField(readModel)}: ${idType(readModel)}):CompletableFuture<${readModelTitle}> {
                           return ${this._generateQuery(slice, readModel)}  
                      }`
            } else {
                var idAttributes = readModelIdAttributes.filter(it => it.name !== "aggregateId")
                var requestParams = idAttributes.map(it => `@RequestParam("${it.name}") ${it.name}:${typeMapping(it.type, it.cardinality,it.optional, it.mutable)}`).join(",\n")
                return `@GetMapping(${endpoint ? `"${endpoint}"` : `"/${slice}"`})
                      fun findReadModel(${requestParams}):CompletableFuture<${readModelTitle}> {
                           return ${this._generateQuery(slice, readModel)}  
                      }`
            }
        }

    }


    _writeProcessors(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()
        var command = slice.commands.length > 0 ? slice.commands[0] : null

        slice.processors?.filter((processor) => processor.title).forEach((processor) => {

            var readModelDependency = processor?.dependencies?.filter((it) => it.type === "INBOUND" && it.elementType === "READMODEL")[0]

            var readModel = config.slices.flatMap(it => it.readmodels).find(it => it.id === readModelDependency?.id)

            if (!readModel) {
                //dont generate processors without readmodel
                // typcially external event processors
                return
            }

            var eventsDeps = readModel?.dependencies?.filter((it) => it.type === "INBOUND" && it.elementType === "EVENT").map(it => it.id) ?? [];

            var events = config.slices.flatMap(it => it.events).filter(it => eventsDeps.includes(it?.id));

            this.fs.copyTpl(
                this.templatePath(`src/components/StatelessProcessor.kt.tpl`),
                this.destinationPath(`./src/main/kotlin/${_packageFolderName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false)}/${title}/internal/${_processorTitle(processor.title)}.kt`),
                {
                    _slice: title,
                    _readModelSlice: _sliceTitle(readModel.slice),
                    _readModel: _readmodelTitle(readModel.title),
                    _typeImports: typeImports(readModel.fields),
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _packageName: _packageName(this.givenAnswers.rootPackageName, config.codeGen?.contextPackage, false),
                    _name: _processorTitle(processor.title),
                    _eventsImports: this._eventsImports(this.answers.processTriggers),
                    _fields: VariablesGenerator.generateVariables(
                        readModel.fields
                    ),
                    _triggers: this._renderStatelessProcessorTriggers(readModel, this.answers.processTriggers || [], events, command),
                    _command: command ? _commandTitle(command.title) : "",
                    link: boardlLink(config.boardId, processor.id),

                })
        })


    }

    _eventsImports(triggers) {
        return triggers?.map((trigger) => {
            return `import ${this.givenAnswers.rootPackageName}.events.${_eventTitle(trigger)}`
        }).join("\n")
    }

    _renderStatelessProcessorTriggers(readModel, triggers, events, command) {
        return triggers.map((event) => {
            return `
                @EventHandler
                fun on(event: ${_eventTitle(event)}) {
                     queryGateway.query(
            ${_readmodelTitle(readModel.title)}Query(${!readModel?.listElement ? "event.aggregateId" : ""}),
            ${_readmodelTitle(readModel.title)}::class.java
        ).thenAccept {
                /*commandGateway.send<${_commandTitle(command.title)}>(
                    ${_commandTitle(command.title)}(
                      ${variableAssignments(command.fields, "it", readModel, "\n", "=")})
                )*/
        }
                }`
        }).join("\n")
    }

    _findSlice(sliceName) {
        return config.slices.find((item) => item.title === sliceName)
    }

};


class ConstructorGenerator {

//(: {name, type, example, mapping}
    static generateConstructorVariables(fields, overrides) {
        return `${fields?.map((field) => (overrides?.includes(field.name) ? "override " : "") + "var " + field.name + ":" + typeMapping(field.type, field.cardinality, field.optional)).filter(it => it).join(",\n\t") ?? ""}`
    }

    static generateCommandConstructorVariables(fields, overrides) {
        return `${fields?.map((field) => (field.idAttribute ? "@TargetAggregateIdentifier " : "") + (overrides?.includes(field.name) ? "override " : "") + "var " + field.name + ":" + typeMapping(field.type, field.cardinality, field.optional)).filter(it => it).join(",\n\t") ?? ""}`
    }
}

class VariablesGenerator {

    static generateLiveReportVariables(fields, identifier) {
        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional, true)} = mutableListOf();`;
            } else {
                return `\t${variable.name == identifier ? "@AggregateIdentifier " : ""}var ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}${variable.optional ? "" : "?"} = null;`;
            }
        }).join("\n")
    }

    static generateEntityVariables(slice, fields, identifier) {
        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `
                 //TODO review type mapping
                 @ElementCollection(fetch = FetchType.EAGER)
                 @CollectionTable(
                    name = "${slice}_${camelCaseToUnderscores(variable.name)}",
                    joinColumns = [JoinColumn(name = "aggregateId")]
                 )
                \tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional, variable.mutable)} = mutableListOf();`;
            } else {
                return `\t${variable.idAttribute ? "@Id " : ""} @Column(name="${slugify(variable.name)}") var ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}${variable.optional ? "" : "?"} = null;`;
            }
        }).join("\n")
    }

    static generateVariables(fields, annotations, mutable) {
        if (!annotations) {
            annotations = []
        }
        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional, mutable)} = ${mutable ? "mutableListOf()" : "emptyList()"};`;
            } else {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}? = null;`;
            }
        }).join("\n")
    }

    static generateInvocation(fields, source) {
        return fields?.map((variable) => {

            return source ? `${source}.${variable.name}` : `${variable.name}`;

        }).filter((it) => it !== "").join(",\n\t") ?? ""
    }

    static generateRestParamInvocation(fields) {
        return fields?.map((variable) => {
            if (variable.type?.toLowerCase() === "date") {
                return `@DateTimeFormat(pattern = "dd.MM.yyyy") @RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}`;
            } else if (variable.type?.toLowerCase() === "datetime") {
                return `@DateTimeFormat(pattern = "dd.MM.yyyy HH:mm:ss") @RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}`;
            } else {
                return `@RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}`;
            }

        }).filter((it) => it !== "").join(",\n\t") ?? ""
    }
}

_renderReadModelSwitchCase = (readModel, events) => {
    if (!readModel.listElement) {
        return `
    events.forEach { event -> 
          when (event) {
             ${events.map(event => {
            return `
                    is ${_eventTitle(event.title)} -> {
                                ${variableAssignments(readModel.fields, "event", event, "\n")}                        
                    }   
                 `
        }).join("\n")}
        }
        
    }
    `
    } else {
        return `
         events.forEach { event ->
          when (event) { 
             ${events.map(event => {
            return `
                    is ${_eventTitle(event.title)} -> {
                                this.data.add(Item(${variableAssignments(readModel.fields, "event", event, ",\n")}))
                                                           
                    }   
                 `
        }).join("\n")}   
            }
        }
            
        `
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

function _slicePackage(title) {
    return `${slugify(title.replaceAll("slice:", "")).replaceAll("-", "")}`
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

function boardlLink(boardId, componentId){
    var link = `https://miro.com/app/board/${boardId}/?moveToWidget=${componentId}`
    return boardId && componentId ? link : undefined
}