var Generator = require('yeoman-generator');
var chalk = require('chalk');
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
const {variableAssignments, processSourceMapping} = require("../../typescript-prototype/common/domain");
const {ClassesGenerator, typeMapping, typeImports} = require("../../common/util/generator");
const {_sliceSpecificClassTitle} = require("../../common/util/naming");


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
                name: 'context',
                loop: false,
                message: 'Choose the ModelContext to generate (no choice means "all")?',
                choices: Array.from(new Set(config.slices.map((item) => item.context).filter(item => item))).sort(),
                when: () => Array.from(new Set(config.slices.map((item) => item.context).filter(item => item))).length > 0,
            },
            {
                type: 'list',
                name: 'slice',
                loop: false,
                message: 'Choose the Slice to generate?',
                choices: (items) => config.slices.filter((slice) => !items.context || items.context?.length === 0 || items.context?.includes(slice.context)).map((item, idx) => item.title).sort()
            },
            {
                type: 'confirm',
                name: 'restendpoint',
                message: 'Generate REST Endpoints?',
                when: (input) => ((config.slices.find((slice) => slice.title === input.slice)?.commands?.length > 0) || (config.slices.find((slice) => slice.title === input.slice)?.readmodels?.length > 0)) ?? false,
            },
            {
                type: 'confirm',
                name: 'specifications',
                loop: false,
                message: 'Generate Specifications (select multiple)?',
                when: (input) => (config.slices.find((slice) => slice.title === input.slice)?.specifications?.length > 0) ?? false,
            },
            {
                type: 'checkbox',
                name: 'liveReportModels',
                message: 'Which ReadModels should read directly from the Eventstream?',
                when: (input) => (config.slices.find((slice) => slice.title === input.slice)?.readmodels?.length > 0) ?? false,
                choices: (items) => config.slices.filter((slice) => !items.context || items.context?.length === 0 || items.context?.includes(slice.context)).filter((item) => item.title === items.slice).flatMap((slice) => slice.readmodels).map(item => item.title)
            },
            {
                type: 'checkbox',
                name: 'processTriggers',
                message: 'Which event triggers the processor?',
                when: (input) => (config.slices.find((slice) => slice.title === input.slice)?.processors?.length > 0) ?? false,
                choices: (items) => config.slices.filter((slice) => !items.context || items.context?.length === 0 || items.context?.includes(slice.context)).filter((item) => item.title === items.slice).flatMap((slice) => slice.events).map(item => item.title)
            }]);

    }

    //writeCommandHandlers() {
    //this.answers.slices.forEach((slice) => {
    //  this._writeCommandHandlers(this.answers.slice)
    //});
    //}

    // _writeCommandHandlers(sliceName) {
    //     var slice = this._findSlice(sliceName)
    //     var title = _slicePackage(slice.title).toLowerCase()
    //     slice.commands?.filter((command) => command.title).forEach((command) => {
    //         this.fs.copyTpl(
    //             this.templatePath(`src/components/CommandHandler.kt.tpl`),
    //             this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${title}/internal/${slugify(command.title).replaceAll("-", "")}CommandHandler.kt`),
    //             {
    //                 _slice: title,
    //                 _commandType: _commandTitle(command.title),
    //                 _rootPackageName: this.givenAnswers.rootPackageName,
    //                 _name: _commandTitle(command.title),
    //                 _typeImports: typeImports(command.fields),
    //                 //for now take first aggregate
    //                 _aggregate: _aggregateTitle((command.aggregateDependencies || ["AGGREGATE"])[0])
    //             }
    //         )
    //     })
    //
    // }

    writeCommands() {
        //this.answers.slices.forEach((slice) => {
        this._writeCommands(this.answers.slice)
        //});
    }

    _writeCommands(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()


        slice.commands?.filter((command) => command.title).forEach((command) => {

            this.fs.copyTpl(
                this.templatePath(`src/components/package-info.java.tpl`),
                this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/domain/commands/${title}/package-info.java`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                }
            )


            this.fs.copyTpl(
                this.templatePath(`src/components/Command.kt.tpl`),
                this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/domain/commands/${title}/${_commandTitle(command.title)}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: _commandTitle(command.title),
                    _fields: ConstructorGenerator.generateConstructorVariables(
                        command.fields,
                        "aggregateId",
                        "aggregateId"
                    ),
                    _typeImports: typeImports(command.fields)

                }
            )
        })


    }


    writeEvents() {
        //this.answers.slices.forEach((slice) => {
        this._writeEvents(this.answers.slice)
        //});
    }

    _writeEvents(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()


        slice.events?.filter((event) => event.title).forEach((event) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/Event.kt.tpl`),
                this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/events/${_eventTitle(event.title)}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: _eventTitle(event.title),
                    _fields: ConstructorGenerator.generateConstructorVariables(
                        event.fields
                    ),
                    //for now take first aggregate
                    _aggregate: _aggregateTitle((event.aggregateDependencies || ["AGGREGATE"])[0]),
                    _typeImports: typeImports(event.fields)

                }
            )
        })


    }

    writeReadModels() {
        //this.answers.slices.forEach((slice) => {
        this._writeReadModels(this.answers.slice)
        //});
    }

    _writeReadModels(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()

        slice.readmodels?.filter((readmodel) => readmodel.title).forEach((readmodel) => {

            let liveReport = this.answers.liveReportModels?.includes(readmodel.title)

            let sliceEvents = config.slices.flatMap(it => it.events)
            let inboundEvents = readmodel.dependencies?.filter(it => it.type === "INBOUND").filter(it => it.elementType === "EVENT").map(it => sliceEvents.find(sliceEvent => it.id === sliceEvent.id)).filter(it => it)

            if (liveReport) {
                this._writeLiveReportReadModel(title, readmodel, inboundEvents)
            } else {
                this._writeQueryableReportReadModel(title, readmodel, inboundEvents)
            }

        })


    }

    _repositoryQuery(readModel) {
        if (readModel.listElement ?? false) {
            return `return ${_readmodelTitle(readModel.title)}(repository.findAll())`
        } else {
            return `
            if(!repository.existsById(query.aggregateId)) {
                return null
            }
            return ${_readmodelTitle(readModel.title)}(repository.findById(query.aggregateId).get())`
        }
    }

    _writeLiveReportReadModel(slice, readmodel, inboundEvents) {
        this.fs.copyTpl(
            this.templatePath(`src/components/LiveReportReadModel.kt.tpl`),
            this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${slice}/${_readmodelTitle(readmodel.title)}.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _name: _readmodelTitle(readmodel.title),
                _fields: VariablesGenerator.generateLiveReportVariables(
                    readmodel.fields,
                    "aggregateId"
                ),
                //for now take first aggregate
                _aggregate: _aggregateTitle((readmodel.aggregateDependencies || ["AGGREGATE"])[0]),
                _eventsImports: this._eventsImports(inboundEvents.map(it => it.title)),

                _eventSourcingHandlers: _eventSourcingHandlers(readmodel, inboundEvents),

                _typeImports: typeImports(readmodel.fields)
            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/LiveReportQueryHandler.kt.tpl`),
            this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${slice}/internal/${_readmodelTitle(readmodel.title)}QueryHandler.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _name: _readmodelTitle(readmodel.title),
                _typeImports: typeImports(readmodel.fields)
            }
        )
    }

    _readModelQueryElement(readModel) {
        if (readModel.listElement ?? false) {
            return `class ${_readmodelTitle(readModel.title)}Query()`
        } else {
            return `data class ${_readmodelTitle(readModel.title)}Query(val aggregateId:UUID)
`
        }
    }

    _writeQueryableReportReadModel(slice, readModel, inboundEvents) {

        let liveReport = this.answers.liveReportModels?.includes(readModel.title)

        if (!liveReport) {
            this.fs.copyTpl(
                this.templatePath(`src/components/QueryableReadModelProjector.kt.tpl`),
                this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${slice}/internal/${_readmodelTitle(readModel.title)}Projector.kt`),
                {
                    _slice: slice,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: _readmodelTitle(readModel.title),
                    _fields: VariablesGenerator.generateVariables(
                        readModel.fields
                    ),
                    //for now take first aggregate
                    _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),
                    _eventsImports: this._eventsImports(inboundEvents.map(it => it?.title)),
                    _eventHandlers: this._renderEventHandlers(readModel, inboundEvents),

                    //no UUID, as this is fixed in the Projector
                    _typeImports: typeImports(readModel.fields, "import java.util.UUID")
                }
            )
        }

        this.fs.copyTpl(
            this.templatePath(`src/components/QueryableReadModelQueryHandler.kt.tpl`),
            this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${slice}/internal/${_readmodelTitle(readModel.title)}QueryHandler.kt`),
            {
                _slice: slice,
                _rootPackageName: this.givenAnswers.rootPackageName,
                _name: _readmodelTitle(readModel.title),
                //for now take first aggregate
                _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),
                _query: this._repositoryQuery(readModel),
                _typeImports: typeImports(readModel.fields)

            }
        )

        this.fs.copyTpl(
            this.templatePath(`src/components/QueryableReadModel.kt.tpl`),
            this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${slice}/${_readmodelTitle(readModel.title)}.kt`),
            {
                _slice: slice,
                _data: this._readModelData(readModel),
                _queryElement: this._readModelQueryElement(readModel),
                _rootPackageName: this.givenAnswers.rootPackageName,
                _name: _readmodelTitle(readModel.title),
                //for now take first aggregate
                _aggregate: _aggregateTitle((readModel.aggregateDependencies || ["AGGREGATE"])[0]),

                _entityFields: VariablesGenerator.generateEntityVariables(
                    readModel.fields,
                    "aggregateId"
                ),
                _typeImports: typeImports(readModel.fields)
            }
        )
    }

    _renderEventHandlers(readModel, events) {
        return events.map(it => {
            return `
@EventHandler
fun on(event: ${_eventTitle(it.title)}) {
    //throws exception if not available (adjust logic)
    val entity = this.repository.findById(event.aggregateId).orElse(${_readmodelTitle(readModel.title)}Entity())
    entity.apply {
        ${variableAssignments(readModel.fields, "event", it, "\n")}
    }.also { this.repository.save(it) }
}`
        }).join("\n")
    }

    writeRestControllers() {
        if (this.answers.restendpoint) {
            //this.answers.slices.forEach((slice) => {
            this._writeRestControllers(this.answers.slice)
            //});
        }

    }

    _writeRestControllers(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()


        slice.commands?.filter((command) => command.title).forEach((command) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/RestResource.kt.tpl`),
                this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${title}/internal/${_restResourceTitle(command.title)}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: title,
                    _command: _commandTitle(command.title),
                    _controller: capitalizeFirstCharacter(title),
                    _typeImports: typeImports(command.fields),
                    _debugendpoint: this._generateDebugPostRestCall(title, VariablesGenerator.generateRestParamInvocation(
                        command.fields
                    ), _commandTitle(command.title), VariablesGenerator.generateInvocation(
                        command.fields
                    )),
                    _payload: ClassesGenerator.generateDataClass(_sliceSpecificClassTitle(sliceName, "Payload"), command.fields),
                    _endpoint: this._generatePostRestCall(title, _commandTitle(command.title),
                        variableAssignments(command.fields, "payload", command, ",\n", "="))
                }
            )
        })
        slice.readmodels?.filter((readmodel) => readmodel.title).forEach((readmodel) => {
            this.fs.copyTpl(
                this.templatePath(`src/components/ReadOnlyRestResource.kt.tpl`),
                this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${title}/internal/ReadOnly${_restResourceTitle(readmodel.title)}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: title,
                    _readModel: _readmodelTitle(readmodel.title),
                    _controller: capitalizeFirstCharacter(title),
                    _typeImports: typeImports(readmodel.fields),
                    _endpoint: this._generateGetRestCall(title, VariablesGenerator.generateRestParamInvocation(
                        //only provide aggregateId (so that proper imports are generated)
                        readmodel.fields?.filter(item => item.name === "aggregateId")
                    ), readmodel)
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

    _generateDebugPostRestCall(slice, restVariables, command, variables) {
        return `
    @CrossOrigin
    @PostMapping("/debug/${slice}")
    fun processDebugCommand(${restVariables}):CompletableFuture<CommandResult> {
        return commandGateway.send(${command}(${variables}))
    }
    `
    }

    _generatePostRestCall(slice, command, variableAssignments) {
        return `
       @CrossOrigin
       @PostMapping("/${slice}/{aggregateId}")
    fun processCommand(
        @PathVariable("aggregateId") aggregateId: UUID,
        @RequestBody payload: ${_sliceSpecificClassTitle(slice, "Payload")}
    ):CompletableFuture<CommandResult> {
         return commandGateway.send(${command}(${variableAssignments}))
        }
       `
    }

    _generateQuery(slice, readModel) {
        var readModelTitle = _readmodelTitle(readModel.title)
        if (readModel.listElement ?? false) {
            return `queryGateway.query(${readModelTitle}Query(), ${readModelTitle}::class.java)`
        } else {
            return `queryGateway.query(${readModelTitle}Query(aggregateId), ${readModelTitle}::class.java)`
        }
    }

    _generateGetRestCall(slice, restVariables, readModel) {
        var readModelTitle = _readmodelTitle(readModel.title)
        if (readModel.listElement) {
            return `@GetMapping("/${slice}")
                    fun findReadModel():CompleteableFuture<${readModelTitle}> {
                         return ${this._generateQuery(slice, readModel)}  
                    }`
        } else {
            return `@GetMapping("/${slice}/{aggregateId}")
                      fun findReadModel(@PathVariable("aggregateId") aggregateId: UUID):CompleteableFuture<${readModelTitle}> {
                           return ${this._generateQuery(slice, readModel)}.get()  
                      }`
        }

    }

    writeSpecifications() {
        if (this.answers.specifications) {
            this.log(chalk.green('starting Specification Generation'))
            this.composeWith(require.resolve('../specifications'), {
                answers: {...this.answers, ...this.givenAnswers},
                appName: this.answers.appName ?? this.appName
            });
        }
    }

    writeProcessors() {
        //this.answers.slices.forEach((slice) => {
        this._writeProcessors(this.answers.slice)
        //});
    }

    _writeProcessors(sliceName) {
        var slice = this._findSlice(sliceName)
        var title = _slicePackage(slice.title).toLowerCase()
        var command = slice.commands.length > 0 ? slice.commands[0] : null


        slice.processors?.filter((processor) => processor.title).forEach((processor) => {

            var readModelDependency = processor?.dependencies?.filter((it) => it.type === "INBOUND" && it.elementType === "READMODEL")[0]

            var readModel = config.slices.flatMap(it => it.readmodels).find(it => it.id === readModelDependency?.id)


            this.fs.copyTpl(
                this.templatePath(`src/components/Processor.kt.tpl`),
                this.destinationPath(`${slugify(this.givenAnswers?.appName)}/src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/${title}/internal/${_processorTitle(processor.title)}.kt`),
                {
                    _slice: title,
                    _rootPackageName: this.givenAnswers.rootPackageName,
                    _name: _processorTitle(processor.title),
                    _eventsImports: this._eventsImports(this.answers.processTriggers),
                    _query: readModel ? `/*var result = ${this._generateQuery(slice, readModel)}*/` : "",
                    _commandInvocation: `/*${this._renderCommandInvocation(command, readModel)}*/`,
                    _triggers: this._renderTriggers(this.answers.processTriggers),
                    _command: command ? _commandTitle(command.title) : ""

                }
            )
        })


    }

    _renderCommandInvocation(command, readModel) {
        if (!command || !readModel) {
            return `// TODO implement logic (no readmodel or command defined)`
        }
        return `
         commandGateway.send<${_commandTitle(command.title)}>(
                ${_commandTitle(command.title)}(
                    ${variableAssignments(command.fields, "result", readModel, "\n", "=")}
                )
            )`;
    }

    _eventsImports(triggers) {
        return triggers.map((trigger) => {
            return `import ${this.givenAnswers.rootPackageName}.events.${_eventTitle(trigger)}`
        }).join("\n")
    }


    _renderTriggers(triggers) {
        return triggers.map((trigger) => {
            return `\t@EventHandler
\tfun on(event: ${_eventTitle(trigger)}) {
\t     logger.info("Processing ${_eventTitle(trigger)}")
\t     process()
\t}`
        }).join("\n\n")
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
    static generateConstructorVariables(fields, overrides, aggregateIdentifier) {
        return `${fields?.map((field) => (field.name === aggregateIdentifier ? "@TargetAggregateIdentifier " : "") + (overrides?.includes(field.name) ? "override " : "") + "var " + field.name + ":" + typeMapping(field.type)).filter(it => it).join(",\n\t") ?? ""}`
    }
}

class VariablesGenerator {

    static generateLiveReportVariables(fields, identifier) {
        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality)} = emptyList();`;
            } else {
                return `\t${variable.name == identifier ? "@AggregateIdentifier " : ""}var ${variable.name}:${typeMapping(variable.type, variable.cardinality)}? = null;`;
            }
        }).join("\n")
    }

    static generateEntityVariables(fields, identifier) {
        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `//\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality)} = emptyList();`;
            } else {
                return `\t${variable.name === identifier ? "@Id @JdbcTypeCode(Types.VARCHAR) " : ""} @Column(name="${slugify(variable.name)}") var ${variable.name}:${typeMapping(variable.type, variable.cardinality)}? = null;`;
            }
        }).join("\n")
    }

//(: {name, type, example, mapping}
    static generateVariables(fields, annotations) {
        if (!annotations) {
            annotations = []
        }
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

        }).filter((it) => it !== "").join(",\n\t") ?? ""
    }

    static generateRestParamInvocation(fields) {
        return fields?.map((variable) => {
            if (variable.type?.toLowerCase() === "date") {

                return `@DateTimeFormat(pattern = "dd.MM.yyyy") @RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality)}`;
            } else {
                return `@RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality)}`;
            }

        }).filter((it) => it !== "").join(",\n\t") ?? ""
    }
}


const invocation = (type, fields) => {
    return `new ${type}(${fields.map((it) => variableNameOrMapping(it)).filter(it => it).join(",")})`
}

const receiverInvocation = (type, receiver) => {
    return `new ${type.title}(${type.fields?.map((it) => receiver + "." + variableNameOrMapping(it)).filter(it => it).join(",")})`
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

const _eventSourcingHandlers = (readModel, events) => {
    var readModelFieldNames = readModel.fields.map((it) => it.name)
    return events.map((event) => {
        return `
    @EventSourcingHandler
    fun on(event: ${_eventTitle(event.title)}) {
       //TODO process fields
       ${
            event.fields.filter(
                (field) => readModelFieldNames.includes(field.name))
                .map((field) => {
                    return processSourceMapping(field, "event", field.name, "=")
                }).join("\n\t\t")
        }
    }`
    }).join("\n")

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
