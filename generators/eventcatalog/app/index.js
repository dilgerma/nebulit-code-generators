var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')

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

        let actorsNames = config.slices.filter((slice) => slice.actors.length > 0).flatMap((slice) => slice.actors).map(it => it.name).filter(it=>it)


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
                }
            )
        })

    }

    _writeActors() {
        config.aggregates?.forEach((aggregate) => {
            this.fs.copyTpl(
                this.templatePath('root/domains/domainname/index.md'),
                this.destinationPath(`${slugify(this.answers.appName)}/domains/${aggregate?.title}/index.md`),
                {
                    name: aggregate?.title,
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
                    }
                )
            })

        })

    }

    _writeEvents() {
        var events = config.slices?.filter(slice=>slice.commands?.length > 0).forEach((slice) => {
            slice.events?.forEach((event) => {

                if (event.aggregate) {
                    this.fs.copyTpl(
                        this.templatePath('root/events/index.md'),
                        this.destinationPath(`${slugify(this.answers.appName)}/domains/${event.aggregate}/events/${event.title}/index.md`),
                        {
                            name: event?.title,
                            _producers: slice.commands.map((command) => toListElement(command.title))
                        }
                    )
                } else {
                    this.fs.copyTpl(
                        this.templatePath('root/events/index.md'),
                        this.destinationPath(`${slugify(this.answers.appName)}/events/${event.title}/index.md`),
                        {
                            name: event?.title,
                            _producers: slice.commands.map((command) => toListElement(command.title))
                        }
                    )
                }
            })
        })

    }

    end() {
        this.log(chalk.blue('Jobs is Done!'))
    }
};

function toListElement(item) {
    return `- ${item}`
}
