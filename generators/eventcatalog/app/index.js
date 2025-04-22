var Generator = require('yeoman-generator');
var slugify = require('slugify')
const schema = require('fluent-json-schema')
const {buildLink} = require("../../common/util/config");
const {uniq} = require("../../common/util/util");


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
                name: 'renderApp',
                message: 'render app?'
            }]);

    }

    setDefaults() {
        if (!this.answers.appName) {
            this.answers.appName = config?.codeGen?.application + "Catalog"
        }
    }

    writing() {
        if (this.answers.renderApp) {
            this._writeApp()
        }

        this._writeDomain()
        this._writeServices();
        this._writeEvents();
        this._writeReadModels();
        this._writeCommands();
        // this._writeActors()
        //
        // if (this.answers.generatorType === 'aggregates') {
        //     this.log(chalk.green('starting aggregates generation'))
        //     this.composeWith(require.resolve('../aggregates'), {
        //         answers: this.answers,
        //         appName: this.answers.appName ?? this.appName
        //     });
        // }
    }

    _writeApp() {

        let actorsNames = config.slices.filter((slice) => slice.actors.length > 0).flatMap((slice) => slice.actors).map(it => it.name).filter(it => it)


        var actors = Array.from(new Set(actorsNames)).map(actor => {
            return {
                id: actor,
                name: actor,
                role: actor,
            }
        })


        this.fs.copyTpl(
            this.templatePath('root/catalog/'),
            this.destinationPath(`${slugify(this.answers.appName)}/`),
            {
                appName: this.answers.appName,
                _actors: JSON.stringify(actors)
            }
        )
    }

    _writeDomain() {
        if (config.codeGen?.domain) {
            var aggregateServices = config.aggregates.map(aggregate => {
                return {aggregate: aggregate, service: aggregate?.service ?? aggregate.title}
            })
            var services = uniq(aggregateServices.flatMap(it => it.service))
            this.fs.copyTpl(
                this.templatePath('root/domains/domainname/index.md'),
                this.destinationPath(`${slugify(this.answers.appName)}/domains/${config.codeGen?.domain}/index.md`),
                {
                    name: config.codeGen?.domain,
                    _description: config.codeGen?.description ?? "",
                    _link: buildLink(config.boardId),
                    _services: asList(services.map(it => `id: ${it}`))
                }
            )
        }
    }

    _writeServices() {

        var aggregateServices = config.aggregates.map(aggregate => {
            return {aggregate: aggregate, service: aggregate?.service ?? aggregate.title}
        })
        var services = uniq(aggregateServices.flatMap(it => it.service))

        services?.forEach((service) => {
            var aggregates = aggregateServices.filter(it => it.service === service)
            var aggregateTitles = aggregates.map(it => simpleSlugify(it.aggregate?.title))

            var allEvents = config.slices.flatMap(it => it.events).filter(it => aggregateTitles.includes(it.aggregate)).map(it => it.title)
            var allCommands = config.slices.flatMap(it => it.commands).filter(it => aggregateTitles.includes(it.aggregateDependencies[0])).map(it => it.title)

            var sends = asList(allEvents, (item) => `id: ${simpleSlugify(item)}\n    version: 0.0.0`)
            var receives = asList(allCommands, (item) => `id: ${simpleSlugify(item)}\n    version: 0.0.0`)
            var descriptions = aggregates.map(it => it.description).join("\n\n")
            this.fs.copyTpl(
                this.templatePath('root/services/index.md'),
                this.destinationPath(`${slugify(this.answers.appName)}/services/${simpleSlugify(service)}/index.md`),
                {
                    _name: simpleSlugify(service),
                    _description: descriptions ?? "",
                    _receives: receives,
                    _sends: sends,
                    _link: buildLink(config.boardId, aggregates[0]?.id)
                }
            )
        })

    }


    _writeActors() {
        config.aggregates?.forEach((actor) => {
            this.fs.copyTpl(
                this.templatePath('root/domains/domainname/index.md'),
                this.destinationPath(`${slugify(this.answers.appName)}/domains/${actor?.title}/index.md`),
                {
                    name: actor?.title,
                    _description: actor.description ?? "",
                    _link: buildLink(config.boardId, actor.id)
                }
            )
        })

    }

    _writeSchema(path, service, event) {
        //schema https://github.com/fastify/fluent-json-schema/blob/master/docs/API.md
        //https://github.com/fastify/fluent-json-schema?tab=readme-ov-file
        //FORMATS: https://github.com/fastify/fluent-json-schema/blob/master/types/FluentJSONSchema.d.ts
        //DEFINE array items - https://stackoverflow.com/questions/59294320/how-to-return-array-in-fluent-schema
        let element = schema.object()
        element = element.title(event.title)
            .description(event.description)
        event.fields?.forEach(field => {
            element = element.prop(field.name, this._fieldType(field.type, field.cardinality))
        })
        let destinationPath = event.aggregate ? `${slugify(this.answers.appName)}/${path}/${service}/${simpleSlugify(event.title)}/schema.json` : `${slugify(this.answers.appName)}/events/${event.title}/schema.json`;
        this.fs.copyTpl(
            this.templatePath('root/events/schema.tpl.json'),
            this.destinationPath(destinationPath),
            {
                _schema: JSON.stringify(element.valueOf(), null, 2)
            }
        )

    }

    _writeEvents() {
        config.slices?.flatMap(it => it.events).forEach(event => {

            if (event.aggregate) {
                let service = serviceName(event.aggregate)
                this.fs.copyTpl(
                    this.templatePath('root/events/index.md'),
                    this.destinationPath(`${slugify(this.answers.appName)}/events/${simpleSlugify(service)}/${simpleSlugify(event.title)}/index.md`),
                    {
                        name: simpleSlugify(event?.title),
                        //_producers: renderProducers(event.dependencies?.filter(it => it.type === "INBOUND").filter(item => item.elementType === "COMMAND").map(elementDependency => toListElement(elementDependency.title))),
                        //_consumers: renderConsumers(event.dependencies?.filter(it => it.type === "OUTBOUND").map(elementDependency => toListElement(elementDependency.title))),
                        _description: event.description ?? "TODO - beschreibung",
                        _link: buildLink(config.boardId, event.id)
                    }
                )
                this._writeSchema("events", service, event)

            }
        })


    }

    _writeReadModels() {
        config.slices?.flatMap(it => it.readmodels).forEach(readModel => {


            if (readModel?.aggregate) {
                let service = serviceName(readModel.aggregate)

                this.fs.copyTpl(
                    this.templatePath('root/queries/index.md'),
                    this.destinationPath(`${slugify(this.answers.appName)}/queries/${simpleSlugify(service)}/${simpleSlugify(readModel.title)}/index.md`),
                    {
                        name: simpleSlugify(readModel?.title),
                        //_producers: renderProducers(event.dependencies?.filter(it => it.type === "INBOUND").filter(item => item.elementType === "COMMAND").map(elementDependency => toListElement(elementDependency.title))),
                        //_consumers: renderConsumers(event.dependencies?.filter(it => it.type === "OUTBOUND").map(elementDependency => toListElement(elementDependency.title))),
                        _description: readModel.description ?? "TODO - beschreibung",
                        _link: buildLink(config.boardId, readModel.id)
                    }
                )
                this._writeSchema("queries", service, readModel)

            }

        })


    }

    _writeCommands() {
        config.slices?.flatMap(it => it.commands).forEach(command => {

            if (command.aggregate) {
                let service = serviceName(command.aggregate)
                this.fs.copyTpl(
                    this.templatePath('root/commands/index.md'),
                    this.destinationPath(`${slugify(this.answers.appName)}/commands/${simpleSlugify(service)}/${simpleSlugify(command.title)}/index.md`),
                    {
                        name: simpleSlugify(command?.title),
                        //_producers: renderProducers(event.dependencies?.filter(it => it.type === "INBOUND").filter(item => item.elementType === "COMMAND").map(elementDependency => toListElement(elementDependency.title))),
                        //_consumers: renderConsumers(event.dependencies?.filter(it => it.type === "OUTBOUND").map(elementDependency => toListElement(elementDependency.title))),
                        _description: command.description ?? "TODO - beschreibung",
                        _link: buildLink(config.boardId, command.id)
                    }
                )
                this._writeSchema("commands", service, command)

            }
        })


    }

    _fieldType(type, cardinality) {

        /*
        * String = "String",
            UUID = "UUID",
            Boolean = "Boolean",
            Double = "Double",
            Date = "Date",
            Long = "Long",
            Int = "Int",
            Custom = "Custom",
        * */
        if (cardinality === "Single") {
            switch (type) {
                case "String":
                    return schema.string()
                case "Boolean":
                    return schema.boolean()
                case "Double":
                    return schema.number()
                case "Long":
                    return schema.number()
                case "Integer":
                    return schema.integer()
                case "UUID":
                    return schema.string().format("uuid")
                case "Date":
                    return schema.string().format("date")
                case "DateTime":
                    return schema.string().format("date-time")
                case "Custom":
                    return schema.object().additionalProperties(true)
                default:
                    return schema.string()
            }
        } else {
            return schema.array().items(
                this._fieldType(type, "Single")
            )
        }
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
