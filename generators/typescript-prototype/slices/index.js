var Generator = require('yeoman-generator');
var {findSlice} = require('../../common/util/config')
var {_screenTitle, _aggregateTitle, _eventTitle, _sliceTitle, _commandTitle} = require('../../common/util/naming')
var {capitalizeFirstCharacter, uniqBy, lowercaseFirstCharacter} = require('../../common/util/util')
const {variables, variableAssignments, renderUnionTypes, renderImports} = require("../common/domain");
const {writeEvents} = require("../events");
const {parseSchema} = require("../../common/util/jsonschema");


let config = {}


module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");

    }

    async prompting() {
        var aggregates = config.aggregates?.map((item, idx) => item.title).sort()
        this.answers = await this.prompt([
            {
                type: 'checkbox',
                name: 'context',
                loop: false,
                message: 'Welchen Kontexte (keine Auswahl für alle)?',
                choices: Array.from(new Set(config.slices.map((item) => item.context).filter(item => item))).sort(),
                when: () => Array.from(new Set(config.slices.map((item) => item.context).filter(item => item))).length > 0,
            },
        ]);

    }


    writeScreen() {
        var slices = config.slices.map((slice) => slice.title)
        slices.forEach((slice) => {
            this._writeScreen(slice)
        });
    }

    _writeScreen(sliceName) {
        var slice = findSlice(config, sliceName)
        var screens = slice.screens


        screens.forEach((screen) => {
            var commands = screen?.dependencies?.filter(dep => dep.type === "OUTBOUND").filter(it => it.elementType === "COMMAND")

            var commandHandlerImports = commands.map(command => `import {handle${_commandTitle(command.title)}} from './${_commandTitle(command.title)}'`).join("\n")
            var schemaImports = commands.map(command => `import ${_commandTitle(command.title)}Schema from './${_commandTitle(command.title)}.json'`).join("\n")

            var handlerMapping = `[${commands.map((command)=>{
                return  `{
                    "command":"${_commandTitle(command.title)}",
                    "handler": handle${_commandTitle(command.title)} ,
                    "schema": ${_commandTitle(command.title)+"Schema"}
                }`
            }).join(",")}]`

            var title = _screenTitle(screen.title).toLowerCase()
            this.fs.copyTpl(
                this.templatePath('page.tsx.tpl'),
                this.destinationPath(`${this.givenAnswers?.appName}/app/components/slices/${_sliceTitle(slice.title)}/${title}.tsx`),
                {
                    _name: title,
                    _pageName: capitalizeFirstCharacter(title),
                    _commands: commands.map((it) => `"${_sliceTitle(sliceName)}/${_commandTitle(it.title)}"`).join(","),
                    _commandHandlerImports: commandHandlerImports,
                    _schemaImports: schemaImports,
                    _handlerMapping: handlerMapping

                }
            )
        })


    }

    processSlices() {
        config.slices.forEach((slice) => {
            this.writeCommands(slice)
        });
    }

    writeCommands(slice) {
        var commands = slice?.commands
        if (!commands || commands.length == 0) {
            return
        }
        commands.filter(command => command).forEach((command) => {
            this._writeCommand(slice, command)
            this._writeCommandSchema(slice, command)
        })
    }

    _writeCommandSchema(slice, command) {
        this.fs.copyTpl(
            this.templatePath(`schema.json.tpl`),
            this.destinationPath(`${this.givenAnswers?.appName}/app/components/slices/${_sliceTitle(slice.title)}/${_commandTitle(command?.title)}.json`),
            {
                _schema: JSON.stringify(parseSchema(command), null, 2)
            }
        )
    }

    _writeCommand(slice, command) {

        let eventsDependencies = command.dependencies.filter((it) => it.type === "OUTBOUND")

        var events = config.slices.flatMap(slice => slice.events).filter(event => eventsDependencies.map(it => it.id).includes(event.id))

        var eventsImports = Array.from(new Set(events.map(event => renderImports(`@/app/components/events/${_aggregateTitle(event.aggregate)}`, [`${_eventTitle(event.title)}`])))).join("\n")


        var aggregates = Array.from(new Set(events.filter(it => it.aggregate).map(it => it.aggregate)))

        var aggregateEventImport = aggregates.map(aggregate => renderImports(`@/app/components/events/${_aggregateTitle(aggregate)}`, [`${_aggregateTitle(aggregate)}Events`])).join("\n")

        var aggregateImports = aggregates.map(aggregate => renderImports(`@/app/components/domain`, [`${_aggregateTitle(aggregate)}`])).join("\n")

        this.fs.copyTpl(
            this.templatePath(`command.ts.tpl`),
            this.destinationPath(`${this.givenAnswers?.appName}/app/components/slices/${_sliceTitle(slice.title)}/${_commandTitle(command?.title)}.ts`),
            {
                _aggregateEventImports: aggregateEventImport,
                _aggregateImports: aggregateImports,
                _eventImports: eventsImports,
                _commandName: _commandTitle(command.title),
                _commandFields: variables([command]),
                _resultEventNames: Array.from(new Set(events.map(event => _eventTitle(event.title)))),
                _handlePerAggregate: this.renderHandlePerAggregate(aggregates, command),
                _cartAggregateHandlers: this.renderAggregateHandler(aggregates),
                _cartAggregateHandlerImports: this.renderAggregateHandlerImports(aggregates),
                _handleCommand: this.handleCommand(command, aggregates)
            }
        )


    }

    handleCommand(command, aggregates) {
        if (!command) {
            return
        }
        return `
        export const handle${_commandTitle(command?.title)} = async (command:${_commandTitle(command.title)}): Promise<any> => {
        
            ${aggregates.map(aggregate => `return await ${lowercaseFirstCharacter(_aggregateTitle(aggregate))}Handler(
                                findEventStore(),
                                command.data.aggregateId,
                                (state:${_aggregateTitle(aggregate)}) => _handle${_aggregateTitle(aggregate)}(command, state)`)
        })
        }
        `;
    }

    renderHandlePerAggregate(aggregateTitles, command) {
        let dependenciesForEvents = command?.dependencies ?? [].filter((it) => it.type === "OUTBOUND")

        var events = config.slices.flatMap(slice => slice.events).filter(event => dependenciesForEvents.map(it => it.id).includes(event.id))

        if (events?.length === 0) {
            return ""
        }

        return aggregateTitles.map(aggregate => {
            return `const _handle${_aggregateTitle(aggregate)} = (command: ${_commandTitle(command.title)}, state: ${_aggregateTitle(aggregate)} ):${_aggregateTitle(aggregate)}Events => {
                return ${this.renderResultEvents(command, events)}
                }
                    `
        }).join("\n");
    }

    renderAggregateHandler(aggregateTitles) {
        if (!aggregateTitles || aggregateTitles.length === 0) {
            return ""
        }

        return aggregateTitles.map((aggregate) => `const ${lowercaseFirstCharacter(_aggregateTitle(aggregate))}Handler = CommandHandler(${lowercaseFirstCharacter(_aggregateTitle(aggregate))}Evolve, ${lowercaseFirstCharacter(_aggregateTitle(aggregate))}InitialState, ${lowercaseFirstCharacter(_aggregateTitle(aggregate))}MapToStreamId)`).join("\n")
    }

    renderAggregateHandlerImports(aggregateTitles) {
        if (!aggregateTitles || aggregateTitles.length === 0) {
            return ""
        }
        return aggregateTitles.map((aggregateTitle) => `import {evolve as ${lowercaseFirstCharacter(_aggregateTitle(aggregateTitle))}Evolve, initialState as ${lowercaseFirstCharacter(_aggregateTitle(aggregateTitle))}InitialState, mapToStreamId as ${lowercaseFirstCharacter(_aggregateTitle(aggregateTitle))}MapToStreamId} from "@/app/components/domain/${_aggregateTitle(aggregateTitle)}"`).join("\n")
    }

    renderResultEvents(command, events) {
        if (command === undefined || events === undefined) {
            return ""
        }
        var resultEventsFromCommand = uniqBy(events, (event) => event.title).map(event => {
            return `{
                type: '${_eventTitle(event.title)}',
                data: {
                    ${variableAssignments(event, "command.data", command, ",\n", ":")}
                }
            }`
        });
        return `[${resultEventsFromCommand.join(",")}]`

    }

}
