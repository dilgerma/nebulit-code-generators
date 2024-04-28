var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')
const schema = require('fluent-json-schema')


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
            message: 'Projektname?',
            when: () => !config?.codeGen?.application,
        },
            {
                type: 'confirm',
                name: 'renderApp',
                message: 'App rendern?'
            }]);
        // , {
        //         type: 'list',
        //         name: 'generatorType',
        //         message: 'Was soll generiert werden?',
        //         choices: ['Basis', 'slices', "aggregates"]
        //     }]);
    }

    setDefaults() {
        if (!this.answers.appName) {
            this.answers.appName = config?.codeGen?.application
        }
    }

    writing() {
        if (this.answers.renderApp) {
            this._writeApp()
        }

        this._writeAggregates();
        this._writeEvents();
        this._writeCommands();
        this._writeActors()
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

    _writeAggregates() {
        config.aggregates?.forEach((aggregate) => {
            this.fs.copyTpl(
                this.templatePath('root/domains/domainname/index.md'),
                this.destinationPath(`${slugify(this.answers.appName)}/domains/${aggregate?.title}/index.md`),
                {
                    name: aggregate?.title,
                    _description: aggregate.description ?? ""
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
                    _description: actor.description ?? ""
                }
            )
        })

    }

    _writeCommands() {
        config.slices?.forEach((slice) => {
            slice.commands.forEach((command) => {
                this.fs.copyTpl(
                    this.templatePath(`root/services/index.md`),
                    this.destinationPath(`${slugify(this.answers.appName)}/services/${command?.title}/index.md`),
                    {
                        name: command?.title,
                        _description: command.description ?? ""
                    }
                )
            })

        })

    }

    _writeSchema(event) {
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
        let destinationPath = event.aggregate ? `${slugify(this.answers.appName)}/domains/${event.aggregate}/events/${event.title}/schema.json` : `${slugify(this.answers.appName)}/events/${event.title}/schema.json`;
        this.fs.copyTpl(
            this.templatePath('root/events/schema.tpl.json'),
            this.destinationPath(destinationPath),
            {
                _schema: JSON.stringify(element.valueOf(), null, 2)
            }
        )

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
                    return schema.string().format("date-time")
                case "Custom":
                    return schema.object().additionalProperties(true)
                default:
                    return schema.string()
            }
        } else {
            return schema.array().items(
                _fieldType(type, "Single")
            )
        }
    }

    _writeEvents() {
        config.slices?.filter(slice => slice.commands?.length > 0).forEach((slice) => {
            slice.events?.forEach((event) => {

                console.log("###" + JSON.stringify(event))

                if (event.aggregate) {
                    this.fs.copyTpl(
                        this.templatePath('root/events/index.md'),
                        this.destinationPath(`${slugify(this.answers.appName)}/domains/${event.aggregate}/events/${event.title}/index.md`),
                        {
                            name: event?.title,
                            _producers: renderProducers(event.dependencies?.filter(it => it.type === "INBOUND").filter(item => item.elementType === "COMMAND").map(elementDependency => toListElement(elementDependency.title))),
                            _consumers: renderConsumers(event.dependencies?.filter(it => it.type === "OUTBOUND").map(elementDependency => toListElement(elementDependency.title))),
                            _description: event.description ?? "TODO - beschreibung"
                        }
                    )
                } else {
                    this.fs.copyTpl(
                        this.templatePath('root/events/index.md'),
                        this.destinationPath(`${slugify(this.answers.appName)}/events/${event.title}/index.md`),
                        {
                            name: event?.title,
                            _description: event.description ?? "TODO - beschreibung",
                            _producers: renderProducers(event.dependencies?.filter(it => it.type === "INBOUND").filter(item => item.elementType === "COMMAND").map(elementDependency => toListElement(elementDependency.title))),
                            _consumers: renderConsumers(event.dependencies?.filter(it => it.type === "OUTBOUND").map(elementDependency => toListElement(elementDependency.title))),
                        }
                    )
                }
                this._writeSchema(event)
            })
        })


    }


    end() {
        this.log(chalk.blue('Jobs is Done!'))
    }
};

function renderProducers(items){
    return items.length > 0 ? `producers:
${items.join("\n")}` : "";
}

function renderConsumers(items) {
    return items.length > 0 ? `consumers:
${items.join("\n")}` : "";
}

function toListElement(item) {
    return `\t- ${item}`
}
