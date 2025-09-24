/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')
const {
    _aggregateTitle,
    _packageName,
    _commandTitle,
    _eventTitle,
    _readmodelTitle,
    _sliceTitle
} = require("../../common/util/naming")
const {variableAssignments, processSourceMapping} = require("../../common/util/variables");
const {idField, uniqBy} = require("../../common/util/util");
const {idType} = require("../../common/util/generator");
const {analyzeSpecs} = require("../../common/util/specs");


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
                type: 'list',
                name: 'aggregate',
                message: 'Which Aggregate should be generated?',
                choices: config?.aggregates?.map((item, idx) => item.title).sort()
            },
            {
                type: 'checkbox',
                name: 'aggregate_slices',
                loop: false,
                message: 'Choose for which Slices to generate Commands- and Eventsourcing Handlers. (generates to .tmp file)',
                choices: (items) => config.slices.filter((slice) => !items.context || items.context?.length === 0 || items.context?.includes(slice.context))
                    .filter(slice => {
                        return slice.commands?.some(command => command.aggregateDependencies?.includes(items.aggregate))
                    })
                    .map((item, idx) => item.title).sort(),
            }]);

    }

    writeAggregates() {
        this._writeAggregates(config.aggregates.find(item => item.title === this.answers.aggregate))
    }

    _writeAggregates(aggregate) {
        var fields = aggregate?.fields?.filter(it => it.name !== "aggregateId").filter(it => !it.idAttribute)
        var idFields = idField(aggregate)
        var idFieldType = idType(aggregate)

        var aggregateFile = this.answers.aggregate_slices?.length > 0 ?
            `${_aggregateTitle(aggregate.title)}.kt.tmp` :
            `${_aggregateTitle(aggregate.title)}.kt`

        this.fs.copyTpl(
            this.templatePath(`src/components/Aggregate.kt.tpl`),
            this.destinationPath(`./src/main/kotlin/${this.givenAnswers.rootPackageName.split(".").join("/")}/domain/${aggregateFile}`),
            {
                _rootPackageName: this.givenAnswers.rootPackageName,
                _packageName: _packageName(this.givenAnswers.rootPackageName, config?.codeGen?.contextPackage, false),
                _name: _aggregateTitle(aggregate.title),
                _fields: VariablesGenerator.generateVariables(
                    //aggregate Id is rendered anyways. for this case just filter it
                    fields
                ),
                _idField: idFields,
                _idType: idFieldType,
                _typeImports: typeImports(fields),
                _commandHandlers: this._renderCommandHandlers(aggregate),
                _elementImports: this._generateImports(aggregate, this.givenAnswers.rootPackageName, config.codeGen?.contextPackage)

            }
        )
    }

    _renderCommandHandlers(aggregate) {


        var commands = config.slices
            .filter(slice => this.answers.aggregate_slices?.includes(slice.title))
            .flatMap(it => it.commands)
            .filter(it => it.aggregateDependencies?.includes(aggregate.title));

        var handlers = commands.map((command) => {
            var eventDeps = uniqBy(command.dependencies.filter(it => it.type === "OUTBOUND")
                .filter(it => it.elementType === "EVENT").map(item => item.id), (eventId) => eventId)
            var events = uniqBy(config.slices.flatMap(slice => slice.events).filter(item => eventDeps.includes(item.id)), (event) => event.id)

            var slice = config.slices.find(it => it.title === command.slice)
            var specs = slice?.specifications?.map(spec => analyzeSpecs(spec))

            return `
            ${specs.length > 0 ? `/*
//AI-TODO: 
        ${specs.join("\n")}
        */` : ``}
    ${command.createsAggregate ? "@CreationPolicy(AggregateCreationPolicy.CREATE_IF_MISSING)" : ""}
        @CommandHandler
        fun handle(command: ${_commandTitle(command.title)}) {
           ${events.map(event => {
                return `
               AggregateLifecycle.apply(${_eventTitle(event.title)}(${variableAssignments(command.fields, "command", event, ",\n", "=")}))
               `
            }).join("\n")}
        }
        
        ${events.map(event => `
        @EventSourcingHandler
        fun on(event: ${_eventTitle(event.title)}){
        // handle event
            ${variableAssignments(aggregate.fields, "event", event, ",\n", "=")}
        }`).join("\n")}
        `
        })

        return handlers.join("\n")

    }

    _generateImports(aggregate, rootPackageName, contextPackage) {

        var commands = config.slices
            .filter(slice => this.answers.aggregate_slices?.includes(slice.title))
            .flatMap(it => it.commands)
            .filter(it => it.aggregateDependencies?.includes(aggregate.title));

        var events = commands.flatMap(command => command.dependencies.filter(it => it.type === "OUTBOUND")
            .filter(it => it.elementType === "EVENT"))
        var commandImports = commands?.map((command) =>
            `import ${_packageName(rootPackageName, contextPackage, false)}.domain.commands.${_sliceTitle(command.slice)}.${_commandTitle(command.title)}`) ?? []
        var eventImports = events?.map((event) =>
            `import ${_packageName(rootPackageName, null, false)}.events.${_eventTitle(event.title)}`) ?? []

        return commandImports.concat(eventImports).join("\n")
    }
};


class VariablesGenerator {

//(: {name, type, example, mapping}
    static generateVariables(fields) {
        return fields?.map((variable) => {
            if (variable.cardinality?.toLowerCase() === "list") {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)} = emptyList();`;
            } else {
                return `\tvar ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}? = null;`;
            }
        }).join("\n")
    }

    static generateInvocation(fields) {
        return fields?.map((variable) => {

            return `${variable.name}`;

        }).filter((it) => it !== "").join(",")
    }

    static generateRestParamInvocation(fields) {
        return fields?.map((variable) => {
            if (variable.type?.toLowerCase() === "date") {

                return `@DateTimeFormat(pattern = "dd.MM.yyyy") @RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}`;
            } else if (variable.type?.toLowerCase() === "datetime") {

                return `@DateTimeFormat(pattern = "dd.MM.yyyy HH:MM:SS") @RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}`;
            }
            {
                return `@RequestParam ${variable.name}:${typeMapping(variable.type, variable.cardinality, variable.optional)}`;
            }

        }).filter((it) => it !== "").join(",")
    }
}

const typeMapping = (fieldType, fieldCardinality, optional) => {
    var fieldType;
    switch (fieldType?.toLowerCase()) {
        case "string":
            fieldType = optional ? "String?" : "String";
            break
        case "double":
            fieldType = optional ? "Double?" : "Double";
            break
        case "long":
            fieldType = optional ? "Long?" : "Long";
            break
        case "boolean":
            fieldType = optional ? "Boolean?" : "Boolean";
            break
        case "date":
            fieldType = optional ? "LocalDate?" : "LocalDate";
            break
        case "datetime":
            fieldType = optional ? "LocalDateTime?" : "LocalDateTime";
            break
        case "uuid":
            fieldType = optional ? "UUID?" : "UUID";
            break
        default:
            fieldType = optional ? "String?" : "String";
            break
    }
    if (fieldCardinality?.toLowerCase() === "list") {
        return `List<${fieldType}>`
    } else {
        return fieldType
    }

}

const typeImports = (fields) => {
    var imports = fields?.map((field) => {
        switch (field.type?.toLowerCase()) {
            case "date":
                return ["import java.time.LocalDate", "import org.springframework.format.annotation.DateTimeFormat"]
            case "datetime":
                return ["import java.time.LocalDateTime", "import org.springframework.format.annotation.DateTimeFormat"]
            case "uuid":
                return ["import java.util.UUID"]
            default:
                return []
        }
        switch (field.cardinality?.toLowerCase()) {
            case "LIST":
                return ["java.util.List"]
            default:
                return []
        }
    })
    return imports?.flat().join(";\n")

}

