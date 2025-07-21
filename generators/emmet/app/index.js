/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')
const {buildLink, findSlice, findSliceByCommandId, findSliceByReadModelId} = require("../../common/util/config");
const {uniq, uniqBy, capitalizeFirstCharacter, groupBy} = require("../../common/util/util");
const {
    _packageFolderName,
    _processorTitle,
    _screenTitle,
    _commandTitle,
    _readmodelTitle,
    _sliceTitle,
    _flowTitle
} = require("../../common/util/naming");
const {variableAssignments} = require("./assignments");
const {analyzeSpecs} = require("../../common/util/specs");
const ejs = require('ejs')
const {v4} = require("uuid");
const {parseSchema} = require("../../common/util/jsonschema");
const {variables} = require("../../nextjs-prototype/common/domain");


function sliceTitle(slice) {
    return slugify(pascalCase(slice.title.replace("slice:", "")), "").replaceAll("-", "")
}

function commandTitle(cmd) {
    return `${slugify(pascalCase(cmd.title)?.replaceAll(" ", "").replaceAll("-", ""))}`
}

function readModelTitle(readmodel) {
    return `${slugify(pascalCase(readmodel.title)?.replaceAll(" ", "").replaceAll("-", ""))}`
}

function specTitle(spec) {
    return `${slugify(pascalCase(spec.title)?.replaceAll(" ", "").replaceAll("-", ""))}`
}

function eventTitle(event) {
    return `${slugify(pascalCase(event.title)?.replaceAll(" ", "").replaceAll("-", ""))}`
}

/** Convert an arbitrary title (e.g. "Item Added") to PascalCase ("ItemAdded"). */
function pascalCase(title) {
    return slugify(title
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[a-z]/, (m) => m.toUpperCase()));
}

/** Map JSON field type + cardinality to a TypeScript type. */
function tsType(field) {
    const base = {
        uuid: 'string',
        string: 'string',
        double: 'number',
        int: 'number',
        integer: 'number',
        boolean: 'boolean',
        custom: 'any',
        date: 'Date',
        datetime: 'Date',
    }[field.type.toLowerCase()] || 'any';

    return field.cardinality && field.cardinality.toLowerCase() === 'list'
        ? `Array<${base}>`
        : base;
}

/** Build the TypeScript source for a single event. */
function renderEvent(event) {
    const typeName = pascalCase(event.title);
    return `export type ${typeName} = Event<'${typeName}', {
        ${event.fields.map((f) => `  ${f.name}: ${tsType(f)}`).join(',\n')},
        }>;`
}

/** Build the TypeScript source for a single event. */
function renderCommand(command) {
    const typeName = pascalCase(command.title);
    return `export type ${typeName}Command = Command<'${typeName}', {
        ${command.fields.map((f) => `  ${f.name}: ${tsType(f)}`).join(',\n')},
        }>;`
}

function renderReadModel(readmodel) {
    const typeName = pascalCase(readmodel.title);
    return `export type ${typeName}ReadModelItem = {
        ${readmodel.fields.map((f) => `  ${f.name}?: ${tsType(f)}`).join(',\n')},
        };
        
        export type ${typeName}ReadModel = {
            data: ${readmodel.listElement ? `${typeName}ReadModelItem[]` : `${typeName}ReadModelItem`}
            }
        `
}

function findTargetField(fieldName, source, target) {
    const name = target.fields.find(it => it.name === fieldName)?.name;
    let targetFieldMapping = target.fields.find(it => it.name === fieldName)?.mapping;
    if (targetFieldMapping) {
        const sourceField = source.fields.find(it => it.name === targetFieldMapping);
        if (sourceField) {
            return sourceField?.name
        }
    }
    // could not match fields
    return fieldName
}

function renderEventAssignment(command, event) {
    return `{
        type: "${eventTitle(event)}",
            data: {
        ${variableAssignments(event.fields, "command.data", command, ",\n", ":")}
    }}`

}

let config = {}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.argument('appname', {type: String, required: false});
        config = require(this.env.cwd + "/config.json");
    }

// Async Await
    async prompting() {
        this.answers = await this.prompt([{
            type: 'input',
            name: 'appName',
            message: 'Projectname?',
            when: () => !config?.codeGen?.application,
        },
            {
                type: 'confirm',
                name: 'skeleton',
                message: 'Generate skeleton ( say yes, if you run this the first time )'
            },
            {
                type: 'checkbox',
                name: 'slices',
                choices: config.slices.map(it => it.title),
                loop: false,
                message: 'Which Slice should be generated?'
            }]);

    }


    setDefaults() {
        if (!this.answers.appName) {
            this.answers.appName = config?.codeGen?.application
        }
    }

    writing() {
        if (this.answers.skeleton) {
            this._writeApp()
        }
    }


    _writeApp() {

        let screens = this._loadScreens()
        let navbarItems = uniqBy(screens, (it) => it.title).map(it => `<Link href="/${_screenTitle(it.title)?.toLowerCase()}" className="navbar-item">
                                            ${_screenTitle(it.title)}
                                        </Link>`)

        this.fs.copyTpl(
            this.templatePath('root'),
            this.destinationPath(slugify(this.answers.appName)),
            {
                rootPackageName: this.answers.rootPackageName,
                appName: this.answers.appName,
                navbar_items: navbarItems
            }
        )

        this.fs.copyTpl(
            this.templatePath('root/.cursor'),
            this.destinationPath(slugify(this.answers.appName) + "/.cursor")
        )

        this.fs.copyTpl(
            this.templatePath('git/gitignore'),
            this.destinationPath(`${slugify(this.answers.appName)}/.gitignore`),
            {
                rootPackageName: this.answers.rootPackageName
            }
        )


    }

    /** Build a union type of all events with imports. */
    _renderEventUnion(slices) {
        const eventData = [];

        slices.forEach((slice) => {
            const events = slice.events || [];
            events
                .filter((ev) => ev.title && ev.context !== 'EXTERNAL') // skip externally managed events
                .forEach((ev) => {
                    const typeName = eventTitle(ev);
                    const fileName = slugify(eventTitle(ev));
                    eventData.push({
                        typeName,
                        fileName
                    });
                });
        });

        if (eventData.length === 0) {
            return {
                imports: '',
                unionType: `export type ${this.answers.appName}Events = never;`
            };
        }

        const imports = eventData
            .map(event => `import { ${event.typeName} } from './${event.fileName}';`)
            .join('\n');

        const unionType = `export type ${this.answers.appName}Events = ${eventData.map(event => event.typeName).join(' | ')};`;

        return `${imports}\n\n${unionType}`
    }


    writingCommands() {

        var slicesNames = this.answers.slices

        const slices = config.slices.filter(it => slicesNames.includes(it.title)) || [];

        slices.forEach((slice) => {
            const commands = slice.commands || [];
            const slicePath = sliceTitle(slice)


            commands
                .forEach((command) => {
                    const tsCode = renderCommand(command);

                    let resultingEvents = command.dependencies
                        .filter(it => it.type === "OUTBOUND" && it.elementType === "EVENT")
                        .map(item => config.slices.flatMap(it => it.events).find(it => it.id === item.id))
                        .map(event => renderEventAssignment(command, event));

                    const aiComment = slice.specifications?.map(spec => analyzeSpecs(spec)).join("\n")

                    const idAttribute = command.fields.find(it => it.idAttribute)?.name ?? "aggregateId"

                    this.fs.copyTpl(
                        this.templatePath(`commands.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/slices/${slicePath}/${commandTitle(command)}Command.ts`),
                        {
                            command: tsCode,
                            slice: slicePath,
                            commandType: commandTitle(command),
                            resultingEvents: resultingEvents,
                            appName: this.answers.appName,
                            aiComment: aiComment
                        })

                    const payloadVars = command.fields.map(it => `${it.name}:${tsType(it)}`).join(",\n")
                    const assignments = variableAssignments(command.fields, "req.body", command, ",\n", ":", (field, renderedItem) => {
                        if (!field.optional) {
                            return `assertNotEmpty(${renderedItem})`
                        } else {
                            return renderedItem
                        }
                    })

                    this.fs.copyTpl(
                        this.templatePath(`commandApi.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/slices/${slicePath}/routes.ts`),
                        {
                            assignments: assignments,
                            //hardcode id for path /.../:id
                            paramVars: "id:string",
                            payloadVars: payloadVars,
                            idAttribute: idAttribute,
                            command: commandTitle(command),
                            path: commandTitle(command)?.toLowerCase(),
                            slice: slicePath,
                        })


                });

        });
    }

    writingEvents() {
        const slices = config.slices || [];

        slices.forEach((slice) => {
            const events = slice.events || [];

            events
                .filter((ev) => ev.title && ev.context !== 'EXTERNAL') // skip externally managed events
                .forEach((ev) => {
                    const tsCode = renderEvent(ev);
                    this.fs.copyTpl(
                        this.templatePath(`events.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/events/${eventTitle(ev)}.ts`),
                        {
                            event: tsCode
                        })
                });
        });

        let unionType = this._renderEventUnion(slices)
        this.fs.copyTpl(
            this.templatePath(`eventunion.ts.tpl`),
            this.destinationPath(`${this.answers.appName}/src/events/${slugify(this.answers.appName?.replaceAll(" ", "").replaceAll("-", ""))}Events.ts`),
            {
                union: unionType
            })
    }

    writingReadModels() {
        var slicesNames = this.answers.slices

        const slices = config.slices.filter(it => slicesNames.includes(it.title)) || [];

        slices.forEach((slice) => {
            const readModels = slice.readmodels || [];


            readModels
                .forEach((readModel) => {

                    let inboundDeps = readModel.dependencies.filter(it => it.type === "INBOUND" && it.elementType === "EVENT")
                        .map(event => config.slices.flatMap(it => it.events).find(it => it.id === event.id))

                    let imports = inboundDeps.map(it => `import { ${eventTitle(it)} } from '../../events/${eventTitle(it)}';`).join("\n")

                    const tsCode = renderReadModel(readModel);
                    const slicePath = sliceTitle(slice)

                    const aiComment = slice.specifications?.map(spec => analyzeSpecs(spec)).join("\n")

                    let caseStatements;

                    if (readModel.listElement) {
                        let idFields = readModel.fields.filter(field => field.idAttribute)
                        caseStatements = inboundDeps.map(event => {
                            let query = idFields.map(field => `item.${field.name} === event.${findTargetField(field.name, event, readModel) ?? `noFieldMatch`}`).join(" && ")
                            if (query) {
                                return `case "${eventTitle(event)}": {
                                const existing = state.data?.find(item => ${query})
                                
                                if(existing) {
                                   Object.assign(existing,  {
                                     ${variableAssignments(readModel.fields, "event", event, ",\n", ":")}
                                   })
                                } else {
                                    state?.data?.push({
                                        ${variableAssignments(readModel.fields, "event", event, ",\n", ":")}
                                    })
                                }
                                return {...state};
                        }`
                            } else {
                                return `case "${eventTitle(event)}": {
                                    state?.data?.push({
                                        ${variableAssignments(readModel.fields, "event", event, ",\n", ":")}
                                    })
                                    return {...state};
                        }`
                            }
                        });

                    } else {
                        caseStatements = inboundDeps.map(it => `case "${eventTitle(it)}": 
                        return {
                            ...document,
                            data: {
                                ${variableAssignments(readModel.fields.sort((a, b) => a?.name?.localeCompare(b.name)), "event", it, ",\n", ":")}
                            }
                        }`
                        )
                    }

                    this.fs.copyTpl(
                        this.templatePath(`readmodel.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/slices/${slicePath}/${readModelTitle(readModel)}Projection.ts`),
                        {
                            slice: slicePath,
                            readModelType: tsCode,
                            readModel: readModelTitle(readModel),
                            eventsUnion: inboundDeps.map(it => eventTitle(it)).join(` | `),
                            eventsList: inboundDeps.map(it => `"${eventTitle(it)}"`).join(` , `),
                            caseStatements: caseStatements.join("\n"),
                            eventImports: imports,
                            aiComment: aiComment,
                            stateAssignment: `const state: ${readModelTitle(readModel)}ReadModel = {...document, data: ${readModel?.listElement ? "[...document?.data??[]]" : "{...{...document?.data}}"}};`

                        })

                    // assume only one id attribute
                    let idAttribute = readModel.fields.find(field => field.idAttribute)
                    this.fs.copyTpl(
                        this.templatePath(`readModelApi.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/slices/${slicePath}/routes.ts`),
                        {
                            readmodel: readModelTitle(readModel),
                            slice: slicePath,
                            idAttribute: idAttribute?.name
                        })

                    if (readModel.todoList) {
                        console.log("###  " + readModel.title + " " + readModel.todoList)
                        this.fs.copyTpl(
                            this.templatePath(`db_migration.ts.tpl`),
                            this.destinationPath(`${this.answers.appName}/supabase/migrations/${generateMigrationFilename(_readmodelTitle(readModel.title).toLowerCase())}`),
                            {
                                readmodel: readModelTitle(readModel)
                            })
                    }

                });
        });

    }

    renderEventstore() {

        let projectionsImports = []
        let projections = []

        var slicesNames = this.answers.slices
        const slices = config.slices.filter(it => slicesNames.includes(it.title)) || [];

        slices.forEach((slice) => {
            const readModels = slice.readmodels || [];

            readModels
                .forEach((readModel) => {
                    const slicePath = sliceTitle(slice)
                    projectionsImports.push(`import {${readModelTitle(readModel)}Projection} from "../slices/${slicePath}/${readModelTitle(readModel)}Projection"`)
                    projections.push(`${readModelTitle(readModel)}Projection`)
                });
        })

        this.fs.copyTpl(
            this.templatePath(`loadEventStore.ts.tpl`),
            this.destinationPath(`${this.answers.appName}/src/common/loadPostgresEventstore.ts`),
            {
                imports: projectionsImports.join("\n"),
                projections: projections.join(",\n"),
            })
    }

    writeSpecs() {
        var slicesNames = this.answers.slices
        const slices = config.slices.filter(it => slicesNames.includes(it.title)) || [];
        slices.forEach(slice => {

            const slicePath = sliceTitle(slice)

            const specs = []

            let globalImports = []

            for (let spec of slice.specifications) {

                // Manually load the template

                let command = config.slices.flatMap(it => it.commands).find(it => it.id === spec.when[0]?.linkedId)


                /**
                 * THIS BLOCK RENDERS EACH SCENARIO AND PUTS IT INTO AN ARRAY FOR LATER
                 */
                if (command) {
                    // STATE VIEW

                    const templatePath = this.templatePath('spec_given_when_then.ts.tpl');
                    const templateContent = this.fs.read(templatePath);

                    const imports = [
                        `import {${commandTitle(command)}Command, ${commandTitle(command)}State, decide, evolve} from "./${commandTitle(command)}Command";`
                    ];
                    globalImports = globalImports.concat(imports)


                    let commandFields = spec.when[0]?.fields?.map(it => `${it.name}: ${exampleOrRandomValue(it.example, it.type)}`).join(",\n");
                    // Render template to string
                    const renderedContent = ejs.render(templateContent, {
                        spec: spec,
                        slice: slicePath,
                        scenario_title: spec.title,
                        command: commandTitle(command),
                        commandFields: commandFields,
                        given: renderGivenEvents(spec.given),
                        then: renderThenEvents(spec.then, command),
                    });
                    specs.push(renderedContent)
                } else if (spec.then.filter(it => it.type === "SPEC_READMODEL")?.length > 0) {
                    // STATE VIEW

                    const templatePath = this.templatePath('spec_given_then.ts.tpl');
                    const templateContent = this.fs.read(templatePath);

                    const stream = v4()


                    let givenFields = uniqBy(spec.given.filter(it => it.type === "SPEC_EVENT").flatMap((it) => it.fields), (it) => it.name).sort((a, b) => a?.name?.localeCompare(b.name))
                    let givenFieldNames = givenFields.map(it => it.name).sort((a, b) => a?.name?.localeCompare(b.name))
                    let givenFieldInitializations = givenFields.map(it => `const ${it.name} = ${exampleOrRandomValue(it.example, it.type)}`)

                    let specReadModel = spec.then[0]
                    let readModel = slice.readmodels.find(it => it.id === specReadModel.linkedId)
                    if (readModel) {
                        let expectedFields = uniq(specReadModel.fields.map(it => `${(!givenFieldNames.includes(it.name) && !it.example) ? "// " : ""}${it.name}: ${it.example ? it.example : it.name}`)).sort((a, b) => a?.name?.localeCompare(b.name))
                        let expectedProjectionValues = `{
                        data: ${readModel.listElement ? "[" : ""}${specReadModel.expectEmptyList ? "" : `{
                            ${expectedFields.join(",\n")}
                            }`}${readModel.listElement ? "]" : ""}
                    }`

                        // Render template to string
                        const renderedContent = ejs.render(templateContent, {
                            stream: stream,
                            spec: spec,
                            slice: slicePath,
                            scenario_title: spec.title,
                            given: renderGivenEvents(spec.given, stream, true),
                            givenFields: givenFieldInitializations.join("\n"),
                            readModel: readModelTitle(specReadModel),
                            expectedProjectionValues: expectedProjectionValues
                        });
                        specs.push(renderedContent)
                    } else {
                        console.log(`Could not render spec. Read Model ${specReadModel.linkedId} not found in slice ${slice.title} and spec ${spec.title}`)
                    }
                }

            }

            /**
             * THIS BLOCK RENDERS THE FULL SPECIFICATION AND PUTS THE ALREADY
             * RENDERED SCENARIOS TOGETHER
             */
            if (specs.length > 0) {
                if (slice.commands?.length > 0) {
                    // STATE CHANGE
                    this.fs.copyTpl(
                        this.templatePath(`spec_state_change.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/slices/${slicePath}/${sliceTitle(slice)}.test.ts`),
                        {
                            slice: slicePath,
                            scenarios: specs.filter(it => it).join("\n"),
                            imports: uniq(globalImports).join("\n")

                        });
                } else if (slice.readmodels.length > 0) {
                    // STATE VIEW
                    // TODO check whether we should support multiple RMs in one slice
                    let readModel = slice.readmodels[0]

                    let eventsUnion = readModel?.dependencies?.filter(it => it.type === "INBOUND" && it.elementType === "EVENT")
                        .map(it => eventTitle(it)).join(" | ")
                    let eventsImports = readModel?.dependencies?.filter(it => it.type === "INBOUND" && it.elementType === "EVENT")
                        .map(it => `import {${eventTitle(it)}} from "../../events/${eventTitle(it)}"`)
                    globalImports = globalImports.concat(eventsImports)

                    // STATE VIEW
                    this.fs.copyTpl(
                        this.templatePath(`spec_state_view.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/slices/${slicePath}/${sliceTitle(slice)}Projection.test.ts`),
                        {
                            eventsUnion: eventsUnion,
                            readModel: readModelTitle(readModel),
                            slice: slicePath,
                            scenarios: specs.filter(it => it).join("\n"),
                            imports: uniq(globalImports).join("\n")

                        });
                }

            }
        });
    }

    /**
     * UX Component rendering
     */

    writeUiComponents() {
        this._writeScreens()

        this._writeCommandsComponents()
        this._writeReadModelComponents()
    }

    _loadScreens() {

        var slicesNames = this.answers.slices
        const slices = config.slices.filter(it => slicesNames.includes(it.title))

        return slices.flatMap(it => it.commands.concat(it.readmodels))
            // only take commands and readmodels connected to screens
            .filter(commandOrReadModel => commandOrReadModel.dependencies?.some(it => it.elementType === "SCREEN"))
            // find all screen ids referenced in the model
            .flatMap(commandOrReadModel => commandOrReadModel.dependencies.filter(it => it.elementType === "SCREEN").flatMap(it => it.id))
            .map(screenId => config.slices.flatMap(it => it.screens).find(it => it.id === screenId))
    }

    _writeScreens() {
        let screens = this._loadScreens()
            .sort((a, b) => (a.prototype?.order ?? 99) - (b.prototype?.order ?? 99))

        let groupedScreens = groupBy(screens, (screen) => screen?.title)
        Object.keys(groupedScreens).filter(it => it).map(title => groupedScreens[title])
            .filter(it => it.filter(item => item).length > 0).forEach((item) => this._writeScreen(item, Object.keys(groupedScreens)))
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

    _writeScreen(screensWithSameTitle, allScreens) {

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

        const commandImports = uniq(commands.map(it => `import {${commandTitle(it)}CommandComponent} from "../../slices/${commandTitle(it)}/ui/${commandTitle(it)}CommandStateChange"`)).join("\n")
        const readModelImports = uniq(readModels.map(it => `import {${readModelTitle(it)}ReadModelStateView} from "../../slices/${readModelTitle(it)}/ui/${readModelTitle(it)}ReadModelStateView"`)).join("\n")
        const selections = uniqBy(commands.concat(readModels), (item) => item.id).map(it => `
                        <div className={"cell ${it.type?.toLowerCase()}"}
                             onClick={() => setView("${it.title?.replaceAll(" ", "")?.toLowerCase()}")}>
                            <h3>${it.title?.replaceAll(" ", "")}</h3>
                            <div>
                                ${it.type}
                            </div>
                        </div>`)

        let commandComponents = uniqBy(commands, (item) => item.id).map(it => `{view == "${commandTitle(it)?.toLowerCase()}" ? <${commandTitle(it)}CommandComponent/> : <span/>}`)
        let readModelComponents = uniqBy(readModels, (item) => item.id).map(it => `{view == "${readModelTitle(it)?.toLowerCase()}" ? <${readModelTitle(it)}ReadModelStateView/> : <span/>}`)
        let navbarItems = uniqBy(allScreens, (it) => it).map(it => `<Link href="/${_screenTitle(it)?.toLowerCase()}" className="navbar-item">
                                            ${_screenTitle(it)}
                                        </Link>`)

        this.fs.copyTpl(
            this.templatePath(`ui/pageComponent.tsx.tpl`),
            this.destinationPath(`${this.answers.appName}/src/screens/${_screenTitle(screenTitle)?.toLowerCase()}/${capitalizeFirstCharacter(_screenTitle(screenTitle))}Component.tsx`),
            {
                appName: this.answers.appName,
                _commandImports: commandImports,
                _readModelImports: readModelImports,
                _pageName: capitalizeFirstCharacter(_screenTitle(screenTitle)),
                _selections: selections.join("\n"),
                _views: commandComponents.concat(readModelComponents).join("\n"),
                navbar_items: navbarItems.join("\n"),

            }
        )

        this.fs.copyTpl(
            this.templatePath(`ui/page.tsx.tpl`),
            this.destinationPath(`${this.answers.appName}/src/pages/${_screenTitle(screenTitle)?.toLowerCase()}.tsx`),
            {
                _pageName: `${capitalizeFirstCharacter(_screenTitle(screenTitle))}`,
                _lowercasePageName: `${_screenTitle(screenTitle)?.toLowerCase()}`
            }
        )


    }

    _writeCommandsComponents() {
        var slicesNames = this.answers.slices
        const slices = config.slices.filter(it => slicesNames.includes(it.title)) || [];
        const commands = slices.flatMap(it => it.commands)

        commands.forEach((command, index) => {

            const idAttribute = command.fields.find(it => it.idAttribute)?.name ?? "aggregateId"

            this.fs.copyTpl(
                this.templatePath(`ui/commandUI.tsx.tpl`),
                this.destinationPath(`${this.answers.appName}/src/slices/${_sliceTitle(command.slice)}/ui/${_commandTitle(command.title)}StateChange.tsx`),
                {
                    command: _commandTitle(command.title),
                    endpoint: commandTitle(command)?.toLowerCase(),
                    idAttribute: idAttribute
                });

            this.fs.copyTpl(
                this.templatePath(`ui/schema.json.tpl`),
                this.destinationPath(`${this.answers.appName}/src/slices/${_sliceTitle(command.slice)}/ui/${_commandTitle(command.title)}.json`),
                {
                    _schema: JSON.stringify(parseSchema(command), null, 2)
                }
            )
        });
    }

    _writeReadModelComponents() {
        var slicesNames = this.answers.slices
        const slices = config.slices.filter(it => slicesNames.includes(it.title)) || [];
        const readmodels = slices.flatMap(it => it.readmodels)

        readmodels.forEach((readmodel, index) => {
            this.fs.copyTpl(
                this.templatePath(`ui/readModelUI.tsx.tpl`),
                this.destinationPath(`${this.answers.appName}/src/slices/${_sliceTitle(readmodel.slice)}/ui/${_readmodelTitle(readmodel.title)}StateView.tsx`),
                {
                    endpoint: readModelTitle(readmodel),
                    readmodel: _readmodelTitle(readmodel.title),
                    lowerCaseReadmodel: _readmodelTitle(readmodel.title)?.toLowerCase(),
                });
        });
    }


    /**
     * End UX Component Rendering
     */

    end() {
        this.log(('Jobs is Done!'))
    }
};


/**
 *
 * @param specEvents
 * @param stream
 * @param useInitializedVars - if true, then we will use variables that are already initialized, otherwise we will use random values
 * @returns {string}
 */
function renderGivenEvents(specEvents, stream, useInitializedVars) {
    let givenEvents = specEvents.filter(it => it.type === "SPEC_EVENT").map(then => {
        const event = config.slices.flatMap(it => it.events).find(it => it.id === then.linkedId)
        if (!event) return ""
        return `{
                        type: '${eventTitle(event)}',
                        data: {
                            ${event.fields?.map(it => `${it.name}: ${useInitializedVars ? it.name : exampleOrRandomValue(then.fields.find(thenField => it.name === thenField.name)?.example, it.type)}`).join(",\n")}
                        },
                        ${stream ? `metadata: {streamName: '${stream}'}` : ""}
                    }`
    })
    return `[${givenEvents.join(",\n")}]`
}

function renderThenEvents(specEvents, command) {

    let error = specEvents.some(it => it.type === "SPEC_ERROR")

    if (!error) {
        let events = specEvents.filter(it => it.type === "SPEC_EVENT").map(then => {
            const event = config.slices.flatMap(it => it.events).find(it => it.id === then.linkedId)
            if (!event) return ""
            return `{
                        type: '${eventTitle(event)}',
                        data: {
                            ${variableAssignments(event.fields, "command.data", command, ",\n", ":")}
                        },
                    }`
        }).join(",\n");
        return `.then([${events}])`
    } else {
        return `.thenThrows()`
    }

}


function serviceName(aggregateName) {
    let aggregate = config.aggregates.find(item => item.title === aggregateName)
    return aggregate.service ? aggregate.service : aggregate.title
}

function simpleSlugify(item) {
    return slugify(item?.replaceAll(" ", ""))
}

function renderProducers(items) {
    return items.length > 0 ? `producers:
${items.join("\n")}` : "";
}

function renderConsumers(items) {
    return items.length > 0 ? `consumers:
${items.join("\n")}` : "";
}

function asList(items, mapping) {
    return items.map(item => toListElement(item, mapping)).join("\n")
}

function toListElement(item, mapping) {
    return `  - ${mapping ? mapping(item) : item}`
}

function exampleOrRandomValue(example, type) {

    if (type === "String") return example ? `"${example}"` : `"${v4()}"`;
    else if (type === "Decimal") return example ? example : Math.random() * 1000;
    else if (type === "Double") return example ? example : Math.random() * 1000;
    else if (type === "Long") return example ? example : Math.round(Math.random() * 1000);
    else if (type === "Int") return example ? example : Math.round(Math.random() * 1000);
    else if (type === "Boolean") return example ? `${example}` : Math.random() < 0.5;
    else if (type === "Date") return example ? `"${example}"` : new Date(Date.now() - Math.random() * 1e12);
    else if (type === "DateTime") example ? `"${example}"` : new Date(Date.now() - Math.random() * 1e12);
    else if (type === "UUID") return example ? `"${example}"` : `"${v4()}"`;
    else return "null // todo: handle complex type";
}

const generateMigrationFilename = (name) => {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    const second = pad(now.getSeconds());

    return `${year}${month}${day}${hour}${minute}${second}_${name}.sql`;
};