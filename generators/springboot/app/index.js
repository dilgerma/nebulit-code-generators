var Generator = require('yeoman-generator');
const {ensureDirSync} = require("fs-extra");
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
            message: 'Projectame?',
            when: () => !config?.codeGen?.application,
        }, {
            type: 'input',
            name: 'rootPackageName',
            message: 'Root Package?',
            when: () => !config?.codeGen?.rootPackage,
        },
            {
                type: 'list',
                name: 'generatorType',
                message: 'What should be generated?',
                choices: ['Skeleton', 'slices', "aggregates"]
            }]);
    }

    setDefaults() {
        if (!this.answers.appName) {
            this.answers.appName = config?.codeGen?.application
        }
        if (!this.answers.rootPackageName) {
            this.answers.rootPackageName = config?.codeGen?.rootPackage
        }
    }

    writing() {

        if (this.answers.generatorType === 'Skeleton') {
            this._writeReactSkeleton();
        } else if (this.answers.generatorType === 'slices') {
            this.log(chalk.green('starting commands generation'))
            this.composeWith(require.resolve('../slices'), {
                answers: this.answers,
                appName: this.answers.appName ?? this.appName
            });
        } else if (this.answers.generatorType === 'aggregates') {
            this.log(chalk.green('starting aggregates generation'))
            this.composeWith(require.resolve('../aggregates'), {
                answers: this.answers,
                appName: this.answers.appName ?? this.appName
            });
        }
    }

    _writeReactSkeleton() {
        this.fs.copyTpl(
            this.templatePath('root'),
            this.destinationPath(slugify(this.answers.appName)),
            {
                rootPackageName: this.answers.rootPackageName,
                appName: this.answers.appName,
            }
        )
        this.fs.copyTpl(
            this.templatePath('src'),
            this.destinationPath(`${slugify(this.answers.appName)}/src/main/kotlin/${this.answers.rootPackageName.split(".").join("/")}`),
            {
                rootPackageName: this.answers.rootPackageName
            }
        )
        this.fs.copyTpl(
            this.templatePath('test'),
            this.destinationPath(`${slugify(this.answers.appName)}/src/test/kotlin/${this.answers.rootPackageName.split(".").join("/")}`),
            {
                rootPackageName: this.answers.rootPackageName
            }
        )
        this.fs.copyTpl(
            this.templatePath('git/gitignore'),
            this.destinationPath(`${slugify(this.answers.appName)}/.gitignore`),
            {
                rootPackageName: this.answers.rootPackageName
            }
        )

    }

    end() {
        this.log(chalk.green('------------'))
        this.log(chalk.magenta('***---***'))
        this.log(chalk.blue('Jobs is Done!'))
        this.log(chalk.green('------------'))
        this.log(chalk.magenta('***---***'))
    }
};
