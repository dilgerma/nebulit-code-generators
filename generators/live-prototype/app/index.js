/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')
var ejs = require('ejs')
const {
    _screenTitle, _sliceTitle, _processorTitle, _commandTitle, _aggregateTitle, _flowTitle, _eventTitle, _readmodelTitle
} = require("../../common/util/naming");
const {parseSchema} = require("../../common/util/jsonschema");
const {renderImports, variables, variableAssignments, variableAssignmentsWithReceiver} = require("./domain");
const {lowercaseFirstCharacter, uniq, groupBy, uniqBy} = require("../../common/util/util");

let config = {}

const defaultAggregate = (aggregate) => {
    return aggregate ? aggregate : "Default"
}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.argument('appname', {type: String, required: false});
        config = opts?.configFile ? require(opts.configFile) : require(this.env.cwd + "/config.json");
    }


    generate() {

        var flows = this._determineFlows()
        var screens = flows.flatMap(flow => this._loadScreensForFlow(flow))
        var css = screens.map(screen => screen?.prototype?.css)
            .filter(it => it).join("\n")

        this.fs.copyTpl(this.templatePath('root/css/prototype.css'), this.destinationPath(`./public/prototype.css`), {
            css: css ?? ""
        })

        this.fs.copyTpl(this.templatePath('root'), this.destinationPath(`./app/prototype`), {
            css: css ?? ""
        })

        this.fs.copyTpl(this.templatePath(`commands/commands.ts.tpl`), this.destinationPath(`./app/prototype/components/commands.ts`))
        this.fs.copyTpl(this.templatePath(`events/events.ts.tpl`), this.destinationPath(`./app/prototype/components/events.ts`))
        this._writeCommands()
        this._writeEvents()
        this._writeReadModels()
        this._writeScreens(flows)
        this._writePage(flows, screens)
        this._writeFlows(flows)
        this._writeAutomations(flows)
    }

    _determineFlows() {
        var flows = config.flows

        var commandsAndReadModels = config.slices.flatMap(slice => {
            return slice.commands.concat(slice.readmodels)
        })
        var defaultFlow = {
            name: "default",
            description: "default flow",
            slices: uniqBy(commandsAndReadModels, (item) => item.id).map((item, cnt) => {
                return {
                    id: item.id, step: cnt, type: item.type, title: item.title
                }
            })
        }

        return [defaultFlow, ...flows]
    }

    _writeFlows(flows) {
        flows.forEach((flow) => {
            this._writeFlow(flow)
        })
    }

    _writeFlow(flow) {
        var title = _flowTitle(flow.name)
        var screens = uniqBy(this._loadScreensForFlow(flow).filter(it => it), item => item.title)
            .sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99))

        this.fs.copyTpl(this.templatePath(`screens/flow.tsx.tpl`), this.destinationPath(`./app/prototype/components/flows/${title}.tsx`), {
            name: title,
            screenImports: this._writeFlow_screenImports(flow, screens),
            viewList: this._writeFlow_viewList(screens),
            viewDisplay: this._writeFlow_viewDisplay(screens)
        })
    }

    _writePage(flows, screens) {
        //<li className={activeView == "my_screen" ? "is-active" : ""}><a onClick={()=>{setActiveView("my_screen")}}>My Screen</a></li>
        var logo = screens.filter(screen => !!screen?.prototype.logo)[0]?.prototype.logo ?? "https://nebulit.de/assets/nebulit.png"
        this.fs.copyTpl(this.templatePath(`screens/page.tsx.tpl`), this.destinationPath(`./app/prototype/page.tsx`), {
            logo: logo,
            screenImports: this._writePage_flowImports(flows),
            flows: this._writePage_flows(flows),
            showFlowSelection: false,
            viewList: this._writePage_flowDisplay(flows),
        })
    }

    _writePage_flows(flows) {
        return flows.map((item) => {
            return `<li><a onClick={()=>setActiveFlow("${_flowTitle(item.name)}")} className={activeFlow === "${_flowTitle(item.name)}" ? "is-active" : ""}>${_flowTitle(item.name)}</a></li>`
        }).join("\n")
    }

    _writePage_flowDisplay(flows) {
        return flows.map((item) => {
            return `{activeFlow === "${_flowTitle(item.name)}" ? <${_flowTitle(item.name)}/>: <span/>}`
        }).join("\n")
    }

    _writePage_flowImports(flows) {
        return flows.map((item) => {
            return `import ${_flowTitle(item.name)} from "@/app/prototype/components/flows/${_flowTitle(item.name)}";`
        }).join("\n")
    }

    _writeFlow_viewDisplay(screens) {
        var screensToRender = screens.concat({"title": "Automations", "prototype": {order: 99999}})
            .sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99))

        return screensToRender.map((screen) => {
            var title = _screenTitle(screen.title)
            return `{
                activeView == "${title}" ? <${title}/> : <span/>
            }`
        }).join("\n")
    }

    _writeFlow_screenImports(flow, screens) {
        //import ActivatedAccounts from "@/app/prototype/screens/ActivatedAccounts";
        var screensToRender = screens.concat({"title": "Automations"})

        return screensToRender.map((screen) => {
            return `import ${_screenTitle(screen.title)} from "@/app/prototype/${_flowTitle(flow.name)}/screens/${_screenTitle(screen.title)}"`
        }).join("\n")
    }

    _writeFlow_viewList(screens) {
        var screensToRender = screens.concat({"title": "Automations", prototype: {order: 999}})
            .sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99))
        var result = screensToRender.map((screen) => {
            var title = _screenTitle(screen.title)
            return `<li className={activeView === "${title}" ? "is-active" : ""}>
                <a onClick={() => {
                    setActiveView("${title}")
                }}>${title}</a></li>`
        }).join("\n")
        return result
    }


    _loadScreensForFlow(flow) {
        var screens = flow.slices.map(it => it.id)
            // get all commands and readmodels in the flow
            .flatMap(commandOrReadModelId => config.slices.flatMap(it => it.commands.concat(it.readmodels))
                .filter(item => item.id === commandOrReadModelId))
            // only take commands and readmodels connected to screens
            .filter(commandOrReadModel => commandOrReadModel.dependencies?.some(it => it.elementType === "SCREEN"))
            // find all screen ids referenced in the model
            .flatMap(commandOrReadModel => commandOrReadModel.dependencies.filter(it => it.elementType === "SCREEN").flatMap(it => it.id))
            .map(screenId => config.slices.flatMap(it => it.screens).find(it => it.id === screenId))

        return screens
    }


    _writeScreens(flows) {
        flows.forEach((flow) => {
            let screens = this._loadScreensForFlow(flow)
                .sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99))

            let groupedScreens = groupBy(screens, (screen) => screen?.title)
            Object.keys(groupedScreens).filter(it => it).map(title => groupedScreens[title])
                .filter(it => it.filter(item => item).length > 0).forEach((item) => this._writeScreen(flow, item))

        })


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

    _writeScreen(flow, screensWithSameTitle) {

        screensWithSameTitle = screensWithSameTitle || []
        var commands = screensWithSameTitle.flatMap(it => it.dependencies.filter(dep => dep.type === "OUTBOUND")
            .filter(dep => dep.elementType === "COMMAND")).map(dep => config.slices.flatMap(it => it.commands).find(it => it.id === dep.id)).filter(it => it)

        var readModels = screensWithSameTitle.flatMap(it => it.dependencies.filter(dep => dep.type === "INBOUND")
            .filter(dep => dep.elementType === "READMODEL")).map(dep => config.slices.flatMap(it => it.readmodels).find(it => it.id == dep.id)).filter(it => it)

        var screenTitle = screensWithSameTitle[0]?.title
        var css = screensWithSameTitle.find(it => !!it.prototype?.css)?.prototype?.css
        var pageTemplate = screensWithSameTitle.find(it => !!it.prototype?.pageTemplate)?.prototype?.pageTemplate?.replaceAll("class=\"", "className=\"")

        let screenImages = config.sliceImages?.filter(it => screensWithSameTitle?.map(item => item.id).includes(it.id))

        let imageList = []
        let descriptionList = []
        for (let screenImage of screenImages) {
            let buffer = this._writeBase64Image(screenImage.base64Image, screenImages.indexOf(screenImage))

            // Write to destination
            this.fs.write(
                `./public/screens/${screenImage.title}-${screenImage.id}.png`, buffer
            );
            imageList.push(`"${screenImage.title}-${screenImage.id}"`)
            let description = config.slices.flatMap(it => it.screens)?.find(it => it.id === screenImage.id)?.description
            descriptionList.push(`"${description}"`)
        }

        console.log("Screen Rendering - Processing commands " + JSON.stringify(commands?.map(it => it.title)??[]))
        // define replacements for data-command="<command title>" for each command, then replace all data-command tags with proper invocations
        const commandReplacements = commands.map(it => it.title.replace(" ","")).map(title => ({title:title, replacement:`data-command="${title}"`}))
        let template = this._pageTemplate(pageTemplate)
        commandReplacements.forEach(replacement => {
            console.log(`replacing ${replacement.replacement} with ${lowercaseFirstCharacter(_commandTitle(replacement.title))}`)
            template = template.replaceAll(replacement.replacement, `onClick={${lowercaseFirstCharacter(_commandTitle(replacement.title))}}`)
        })

        console.log(template)

        this.fs.copyTpl(this.templatePath(`screens/screen.tsx.tpl`), this.destinationPath(`./app/prototype/${_flowTitle(flow.name)}/screens/${_screenTitle(screenTitle)}.tsx`), {
            name: _screenTitle(screenTitle),
            images: imageList,
            descriptions: descriptionList,
            firstImage: imageList[0],
            readModelResolvers: this._writeScreen_readModelResolvers(readModels),
            commmandHandlers: this._writeScreen_commandHandlers(commands),
            commandButtons: this._writeScreen_commandButtons(commands),
            commandModals: this._writeScreen_commandModals(commands, readModels),
            commandInitializers: this._writeScreen_commandInitialzersFromReadModels(commands, readModels),
            commandEnablements: this._writeScreen_commandEnablements(commands),
            title: _screenTitle(screenTitle),
            template: ejs.render(template, {
                title: _screenTitle(screenTitle),
                main: this._writeScreen_readModelMain(readModels, "MAIN", false),
                aside: this._writeScreen_readModelMain(readModels, "RIGHT", true),
            }),
            commandInvokers: this._writeScreen_commandButton_function(commands),
            css: css ?? ""
        })
    }

    _writeScreen_commandEnablements(commands) {
        return uniqBy(commands, it => it.id).map((command) => {
            return `import {checkCommand as check${_commandTitle(command.title)}} from "@/app/prototype/components/slices/${_sliceTitle(command.slice)}/${_commandTitle(command.title)}"`
        }).join("\n")

    }

    _pageTemplate(template) {
        return template ? template : `<div className="big-top-margin">
                <div className="columns">
                    <main className="column is-8">
                    <%- main%>
                    </main>
                    <aside className="column is-4">
                      <%- aside%>
                    </aside>
                </div>
            </div>`
    }

    _writeAutomations(flows) {

        flows.forEach((flow) => {
            var commands = flow.slices.filter(it => it.type === "COMMAND")
                .map(flowCommand => config.slices.flatMap(it => it.commands).find(it => it.id === flowCommand.id))
                .filter(command => command.dependencies.filter(it => it.type === "INBOUND").some(it => it.elementType === "AUTOMATION"))

            var processors = commands.flatMap(it => it.dependencies.find(it => it.elementType === "AUTOMATION"))
                .map(processorDep => config.slices.flatMap(it => it.processors).find(it => it.id === processorDep.id))

            var readModels = processors.flatMap(processor => processor.dependencies.filter(it => it.type === "INBOUND")
                .filter(it => it.elementType === "READMODEL"))
                .map(readmodelDep => config.slices.flatMap(it => it.readmodels).find(it => it.id === readmodelDep.id))
                .filter(it => it)

            this.fs.copyTpl(this.templatePath(`automations/automations.tsx.tpl`), this.destinationPath(`./app/prototype/${_flowTitle(flow.name)}/screens/Automations.tsx`), {
                readModelResolvers: this._writeScreen_readModelResolvers(readModels),
                commmandHandlers: this._writeScreen_commandHandlers(commands),
                commandButtons: this._writeAutomation_commandButtons(commands),
                commandModals: this._writeScreen_commandModals(commands, readModels),
                commandInitializers: this._writeScreen_commandInitialzersFromReadModels(commands, readModels, true),
                automationAvailabilityChecks: this._writeAutomations_automationAvailable(commands),
            })
        })

    }

    _writeAutomations_automationAvailable(commands, processors) {

        return commands.map((command) => {
            let processorDep = command.dependencies.find(it => it.elementType === "AUTOMATION")
            let processor = config.slices.flatMap(it => it.processors).find(it => it.id === processorDep.id)
            let activeByDefault = processor?.prototype?.activeByDefault ?? false
            return `
            //@ts-ignore
            const check${_commandTitle(command.title)}ProcessorActive = ()=>${activeByDefault} || Object.values(resolve${_commandTitle(command.title)}InitValues()).some(value => value !== null && value !== undefined && value !== '')`
        })
            .join("\n")
    }

    _writeScreen_readModelMain(readModels, placement, exactPlacement) {
        return uniqBy(readModels.filter(it => (!it.prototype?.placement && !exactPlacement) || it.prototype?.placement === placement), (it => it.id))
            .sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99))
            .map(readModel => {
                var title = _readmodelTitle(readModel.title)

                if (readModel.listElement) {
                    return `<div className="top-margin"><ListComponent ${readModel?.prototype?.renderFunction ? `renderFunction={${readModel?.prototype?.renderFunction}}` : ''} label="${readModel?.prototype?.label ?? readModel?.title}" readModel={query${title}()}></ListComponent></div>`
                } else {
                    return `<div className="top-margin"><SingleComponent ${readModel?.prototype?.renderFunction ? `renderFunction={${readModel?.prototype?.renderFunction}}` : ''} label="${readModel?.prototype?.label ?? readModel?.title}" readModel={query${title}()}></SingleComponent></div>`
                }
            }).join("\n")
    }

    _writeScreen_readModelResolvers(readModels) {
        return uniq(readModels, (it => it.id)).map(item => {
            var title = _readmodelTitle(item.title)
            return `import {resolve as query${title}} from "@/app/prototype/components/slices/${_sliceTitle(item.slice)}/${title}";`
        }).join("\n")
    }

    _writeScreen_commandHandlers(commands) {

        return uniq(commands, (it => it.id)).map(item => {
            var title = _commandTitle(item.title)
            return `import {handle as handle${title}} from "@/app/prototype/components/slices/${_sliceTitle(item.slice)}/${title}"
`
        }).join("\n")
    }

    /**
     * invoke function that can be called from within the template
     */
    _writeScreen_commandButton_function(commands) {
        return uniq(commands, (it => it.id)).sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99)).map((command) => {

            var title = _commandTitle(command.title)
            var slice = _sliceTitle(command.slice)

            return `const ${lowercaseFirstCharacter(_commandTitle(command.title))} = () => {
            if(check${_commandTitle(command.title)}().enabled){
                setActiveCommand("${title}")
                setSlice("${slice}")
                setCommand("${title}")
                setModalActive(true)
            }}`
        }).join("\n")
    }

    _writeScreen_commandButtons(commands) {
        return uniq(commands, (it => it.id)).sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99)).map((command) => {

            var title = _commandTitle(command.title)
            var slice = _sliceTitle(command.slice)

            return `<button onClick={() => {
            if(check${_commandTitle(command.title)}().enabled){
                setActiveCommand("${title}")
                setSlice("${slice}")
                setCommand("${title}")
                setModalActive(true)
            }
        }} className={${`!check${_commandTitle(command.title)}().enabled ? "button top-margin right-margin is-disabled" : "button top-margin right-margin is-info"}`}>${command?.prototype?.label ? command?.prototype?.label : title}</button>`
        }).join("\n")
    }

    _writeAutomation_commandButtons(commands) {
        return uniq(commands, (it => it.id)).sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99)).map((command) => {

            var title = _commandTitle(command.title)
            var slice = _sliceTitle(command.slice)


            return `{check${_commandTitle(command.title)}ProcessorActive() ? <button onClick={() => {
                setActiveCommand("${title}")
                setSlice("${slice}")
                setCommand("${title}")
                setModalActive(true)
            
        }} className={"is-info button top-margin right-margin is-success"}>${command?.prototype?.label ? command?.prototype?.label : title}</button> : <span/>}`
        }).join("\n")
    }

    _findTransitiveCommandDependencies(screensAndProcessors, command, readModels) {
        return command.dependencies.filter(it => it.type === "INBOUND").filter(it => it.elementType === "SCREEN" || it.elementType === "AUTOMATION")
            .map(it => screensAndProcessors.find(item => item.id === it.id)).flatMap(it => it.dependencies.filter(it => it.type === "INBOUND").filter(item => item.elementType === "READMODEL"))
            .map(it => readModels.find((item) => item.id === it.id)).filter(it => it)
    }

    _writeScreen_commandInitialzersFromReadModels(commands, readModels, allowListModels = false) {

        // this one is more complicated.
        // find all screens and processors
        // find all inbound read model dependencies and the read models
        // iterate over all read models and assign variables where appropriate

        return uniqBy(commands, (it => it.id)).map((command) => {
            var screensAndProcessors = config.slices.flatMap(slice => slice.screens.concat(slice.processors))

            let transitiveReadModelDependencies = this._findTransitiveCommandDependencies(screensAndProcessors, command, readModels)

            return `
            const resolve${_commandTitle(command.title)}InitValues = ()=>{
            ${transitiveReadModelDependencies.map(readModel => {
                return `let prepared${_readmodelTitle(readModel.title)} = query${_readmodelTitle(readModel.title)}()`
            }).join("\n")}
            var data = {
            ${transitiveReadModelDependencies.filter(it => it?.listElement === allowListModels).map(readModel => {
                return readModel?.listElement ? variableAssignments(command.fields, `prepared${_readmodelTitle(readModel.title)}?.resultList[0]?`, readModel, ",\n", ":") : variableAssignments(command.fields, `prepared${_readmodelTitle(readModel.title)}.result`, readModel, ",\n", ":")
                // list element

            })}
            }
            return data
            }
            `
        }).join("\n")

    }


    _writeScreen_commandModals(commands) {


        return uniqBy(commands, (it => it.id)).map((command) => {

            var title = _commandTitle(command.title)
            var slice = _sliceTitle(command.slice)

            return `{activeCommand == "${title}" ?
                <div className="box">
                    <JsonForm submit={async (data: FormData, errors: RJSFValidationError[]) => {
                        await handle${title}(data)
                        setModalActive(false)
                    }} formData={resolve${_commandTitle(command.title)}InitValues()} command={command!!} slice={slice!!}/>

                </div> : <span/>}`

        }).join("\n")
    }


    _writeReadModels() {
        config.slices.forEach((slice) => {
            var readModels = slice?.readmodels || []
            if (!readModels || readModels.length === 0) {
                return
            }
            readModels.filter(readModels => readModels).forEach((readModel) => {
                this._writeReadModel(readModel)
            })
        })
    }

    _writeReadModel(readModel) {

        let eventsDependencies = readModel.dependencies.filter((it) => it.type === "INBOUND")

        var events = config.slices.flatMap(slice => slice.events).filter(it => it.context !== "EXTERNAL").filter(event => eventsDependencies.map(it => it.id).includes(event.id))
        var aggregates = uniq(events.map(it => `"${_aggregateTitle(defaultAggregate(it.aggregate))}"`))

        this.fs.copyTpl(this.templatePath(`readmodels/readmodel.ts.tpl`), this.destinationPath(`./app/prototype/components/slices/${_sliceTitle(readModel.slice)}/${_readmodelTitle(readModel?.title)}.ts`), {
            name: _readmodelTitle(readModel.title), //dont add defaults here, its hard to configure
            projection: readModel?.prototype?.projection ? readModel?.prototype?.projection : (readModel?.listElement ? "this.resultList = [{'result' : 'no projection configured'}]" : `${this._defaultSingleProjection(readModel, events)}`),
            aggregates: aggregates,
            initialValue: readModel?.prototype?.initialValue ?? `{}`
        });
    }

    _defaultSingleProjection(readModel, dependencies) {
        return `events.forEach((eventData)=>{
    let event = eventData.data
    switch(eventData.type) {
   ${dependencies.map(dep => {
            return `
       \tcase '${_eventTitle(dep.title)}':
                ${variableAssignmentsWithReceiver("this.result", readModel.fields, "event", dep, "", "=")}
        \treturn;
        `
        }).join("\n")}
        }
        })
    `
    }


    _writeEvents() {
        config.slices.forEach((slice) => {
            var events = slice?.events?.filter(it => it.context !== "EXTERNAL")
            if (!events || events.length === 0) {
                return
            }
            events.filter(event => event).forEach((event) => {
                this._writeEvent(event)
            })
        })
    }

    _writeEvent(event) {

        var path = `./app/prototype/components/events/${_aggregateTitle(defaultAggregate(event.aggregate)).toLowerCase()}/${_eventTitle(event?.title)}.ts`

        this.fs.copyTpl(this.templatePath(`events/event.ts.tpl`), this.destinationPath(path), {
            name: _eventTitle(event.title),
            fields: variables([event]),
            aggregate: _aggregateTitle(defaultAggregate(event.aggregate))
        })
    }

    _writeCommands() {

        config.slices.forEach((slice) => {
            var commands = slice?.commands
            if (!commands || commands.length === 0) {
                return
            }
            commands.filter(command => command).forEach((command) => {
                this._writeCommand(slice, command)
                this._writeCommandSchema(slice, command)
            })
        })
    }


    _writeCommandSchema(slice, command) {
        this.fs.copyTpl(this.templatePath(`commands/schema.json.tpl`), this.destinationPath(`./app/prototype/components/slices/${_sliceTitle(slice.title)}/${_commandTitle(command?.title)}.json`), {
            _schema: JSON.stringify(parseSchema(command), null, 2)
        })
    }

    _writeCommand(slice, command) {

        let eventsDependencies = command.dependencies.filter((it) => it.type === "OUTBOUND")
        var events = config.slices.flatMap(slice => slice.events).filter(it => it.context !== "EXTERNAL").filter(event => eventsDependencies.map(it => it.id).includes(event.id))
        var eventsImports = Array.from(new Set(events.map(event => renderImports(`@/app/prototype/components/events/${_aggregateTitle(defaultAggregate(event.aggregate)).toLowerCase()}`, [`${_eventTitle(event.title)}`])))).join("\n")
        //var eventsWithoutAggregateImports = Array.from(new Set(events.filter(event => !event.aggregate).map(event => renderImports(`@/app/prototype/components/events/`, [`${_eventTitle(event.title)}`])))).join("\n")
        var commandIdField = command?.fields?.find(it => it.identifier)
        if (!commandIdField) {
            commandIdField = "aggregateId"
        }


        var screensAndProcessors = config.slices.flatMap(slice => slice.screens.concat(slice.processors))
        var readModels = config.slices.flatMap(slice => slice.readmodels)

        let transitiveCommandDependencies = this._findTransitiveCommandDependencies(screensAndProcessors, command, readModels)
        var aggregates = uniq(transitiveCommandDependencies.flatMap(it => it.aggregateDependencies)
            .map(it => defaultAggregate(it))
            .filter(it => it).map(it => `"${_aggregateTitle(defaultAggregate(it))}"`))

        // also use aggregate dependencies from given
        var deps = slice.specifications?.flatMap(it => it.given).map(event => config.slices.flatMap(it => it.events).find(it => it.id === event.linkedId))
        aggregates.push(uniq(deps.map(it => defaultAggregate(it.aggregate)).filter(it => it).map(it => `"${_aggregateTitle(it)}"`)))
        aggregates = uniq(aggregates)

        var renderedEvents = events.map(event => {
            return `
            {
                type: '${_eventTitle(event.title)}',
                data: {
        ${variableAssignments(event.fields, "command.data", command, ",\n", ":")}
                },
                metadata: {
                    aggregate: "${_aggregateTitle(defaultAggregate(event.aggregate))}"
                }
            }
            `
        });

        this.fs.copyTpl(this.templatePath(`commands/command.ts.tpl`), this.destinationPath(`./app/prototype/components/slices/${_sliceTitle(slice.title)}/${_commandTitle(command?.title)}.ts`), {
            aggregates: aggregates,
            projection: command.prototype?.projection,
            name: _commandTitle(command.title),
            fields: variables([command]),
            slice: _sliceTitle(command.slice),
            aggregate: _aggregateTitle(defaultAggregate(command.aggregate)),
            eventsImports: eventsImports,
            events: renderedEvents,
            idField: commandIdField,
            initialValue: command?.prototype?.initialValue?.toString() === "true"
        })


    }

    end() {
    }
};
