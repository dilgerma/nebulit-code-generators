/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')
const {buildLink} = require("../../common/util/config");
const {uniq} = require("../../common/util/util");
const {_packageFolderName, _processorTitle} = require("../../common/util/naming");
const {variableAssignments} = require("./assignments");
const {analyzeSpecs} = require("../../common/util/specs");

function sliceTitle(slice) {
    return slugify(pascalCase(slice.title.replace("slice:", "")), "").replaceAll("-", "")
}

function commandTitle(cmd) {
    return `${slugify(pascalCase(cmd.title)?.replaceAll(" ", "").replaceAll("-", ""))}`
}

function readModelTitle(readmodel) {
    return `${slugify(pascalCase(readmodel.title)?.replaceAll(" ", "").replaceAll("-", ""))}`
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

function findTargetField(fieldName, target) {
    return target.fields.find(it => it.name === fieldName || it.mapping === fieldName)?.name
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
        }])

    }

    setDefaults() {
        if (!this.answers.appName) {
            this.answers.appName = config?.codeGen?.application
        }
    }

    writing() {
        this._writeApp()
    }

    _writeApp() {

        this.fs.copyTpl(
            this.templatePath('root/'),
            this.destinationPath(`${slugify(this.answers.appName)}/`),
            {
                appName: this.answers.appName,
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
                    const typeName = pascalCase(ev.title);
                    const fileName = slugify(ev.title?.replaceAll(" ", "").replaceAll("-", ""));
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
        const slices = config.slices || [];

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

                    this.fs.copyTpl(
                        this.templatePath(`commands.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/app/slices/${slicePath}/${commandTitle(command)}Command.ts`),
                        {
                            command: tsCode,
                            slice: slicePath,
                            commandType: commandTitle(command),
                            resultingEvents: resultingEvents,
                            appName: this.answers.appName,
                            aiComment:aiComment
                        })

                    this.fs.copyTpl(
                        this.templatePath(`commandApi.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/app/api/${slicePath?.toLowerCase()}/route.ts`),
                        {
                            idAttribute: (command.fields.find(it => it.idAttribute)?.name) ?? "aggregateId",
                            command: commandTitle(command),
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
                        this.destinationPath(`${this.answers.appName}/src/app/events/${slugify(ev.title?.replaceAll(" ", "").replaceAll("-", ""))}.ts`),
                        {
                            event: tsCode
                        })
                });
        });

        let unionType = this._renderEventUnion(slices)
        this.fs.copyTpl(
            this.templatePath(`eventunion.ts.tpl`),
            this.destinationPath(`${this.answers.appName}/src/app/events/${slugify(this.answers.appName?.replaceAll(" ", "").replaceAll("-", ""))}Events.ts`),
            {
                union: unionType
            })
    }

    writingReadModels() {
        const slices = config.slices || [];

        slices.forEach((slice) => {
            const readModels = slice.readmodels || [];


            readModels
                .forEach((readModel) => {

                    let inboundDeps = readModel.dependencies.filter(it => it.type === "INBOUND" && it.elementType === "EVENT")
                        .map(event => config.slices.flatMap(it => it.events).find(it => it.id === event.id))

                    let imports = inboundDeps.map(it => `import { ${eventTitle(it)} } from '@/app/events/${eventTitle(it)}';`).join("\n")

                    const tsCode = renderReadModel(readModel);
                    const slicePath = sliceTitle(slice)

                    const aiComment = slice.specifications?.map(spec => analyzeSpecs(spec)).join("\n")

                    let caseStatements;

                    if (readModel.listElement) {
                        let idFields = readModel.fields.filter(field => field.idAttribute)
                        caseStatements = inboundDeps.map(event => {
                            let query = idFields.map(field => `item.${field.name} === event.${findTargetField(field.name, event)??`noFieldMatch`}`).join(" && ")

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
                        });

                    } else {
                        caseStatements = inboundDeps.map(it => `case "${eventTitle(it)}": 
                        return {
                            ...document,
                            ${variableAssignments(readModel.fields, "event", it, ",\n", ":")}
                        }`
                        )
                    }


                    this.fs.copyTpl(
                        this.templatePath(`readmodel.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/app/slices/${slicePath}/${readModelTitle(readModel)}Projection.ts`),
                        {
                            slice: slicePath,
                            readModelType: tsCode,
                            readModel: readModelTitle(readModel),
                            eventsUnion: inboundDeps.map(it => eventTitle(it)).join(` | `),
                            eventsList: inboundDeps.map(it => `"${eventTitle(it)}"`).join(` , `),
                            caseStatements: caseStatements.join("\n"),
                            eventImports: imports,
                            aiComment: aiComment

                        })

                    this.fs.copyTpl(
                        this.templatePath(`readModelApi.ts.tpl`),
                        this.destinationPath(`${this.answers.appName}/src/app/api/${slicePath?.toLowerCase()}/route.ts`),
                        {
                            readModel: readModelTitle(readModel),
                            slice: slicePath,
                        })
                });
        });

        let unionType = this._renderEventUnion(slices)
        this.fs.copyTpl(
            this.templatePath(`eventunion.ts.tpl`),
            this.destinationPath(`${this.answers.appName}/src/app/events/${slugify(this.answers.appName?.replaceAll(" ", "").replaceAll("-", ""))}Events.ts`),
            {
                union: unionType
            })
    }

    renderEventstore() {

        let projectionsImports = []
        let projections = []
        config.slices.forEach((slice) => {
            const readModels = slice.readmodels || [];

            readModels
                .forEach((readModel) => {
                    const slicePath = sliceTitle(slice)
                    projectionsImports.push(`import {${readModelTitle(readModel)}Projection} from "@/app/slices/${slicePath}/${readModelTitle(readModel)}Projection"`)
                    projections.push(`${readModelTitle(readModel)}Projection`)
                });
        })

        this.fs.copyTpl(
            this.templatePath(`loadEventStore.ts.tpl`),
            this.destinationPath(`${this.answers.appName}/src/app/common/loadPostgresEventstore.ts`),
            {
                imports: projectionsImports.join("\n"),
                projections: projections.join(",\n"),
            })
    }


    end() {
        this.log(('Jobs is Done!'))
    }
};

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
