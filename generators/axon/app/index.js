/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator').default;
var slugify = require('slugify')


let config = {}

module.exports = class extends Generator {

    defaultAppName = "app"

    constructor(args, opts) {
        super(args, opts);

        this.argument('appname', { type: String, required: false });

        const configPath = `${this.env.cwd}/config.json`;

        try {
            config = require(configPath);
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error(`❌ No config.json found at ${configPath}. Please create one first.`);
            } else {
                throw err; // other errors (invalid JSON etc.)
            }
        }
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
            this.answers.appName = config?.codeGen?.application ?? this.defaultAppName
        }
        if (!this.answers.rootPackageName) {
            this.answers.rootPackageName = config?.codeGen?.rootPackage
        }
    }

    writing() {

        if (this.answers.generatorType === 'Skeleton') {
            this._writeSkeleton();
        } else if (this.answers.generatorType === 'slices') {
            this.log('starting commands generation')
            this.composeWith(require.resolve('../slices'), {
                answers: this.answers,
                appName: this.answers.appName ?? this.appName
            });
        } else if (this.answers.generatorType === 'aggregates') {
            this.log('starting aggregates generation')
            this.composeWith(require.resolve('../aggregates'), {
                answers: this.answers,
                appName: this.answers.appName ?? this.appName
            });
        }
    }

    _writeSkeleton() {
        this.fs.copyTpl(
            this.templatePath('root'),
            this.destinationPath("."),
            {
                rootPackageName: this.answers.rootPackageName,
                appName: this.answers.appName !== "." ? slugify(this.answers.appName) : "app",
            }
        )
        this.fs.copyTpl(
            this.templatePath('src'),
            this.destinationPath(`./src/main/kotlin/${this.answers.rootPackageName.split(".").join("/")}`),
            {
                rootPackageName: this.answers.rootPackageName
            }
        )
        this.fs.copyTpl(
            this.templatePath('test'),
            this.destinationPath(`./src/test/kotlin/${this.answers.rootPackageName.split(".").join("/")}`),
            {
                rootPackageName: this.answers.rootPackageName
            }
        )
        this.fs.copyTpl(
            this.templatePath('git/gitignore'),
            this.destinationPath(`./.gitignore`),
            {
                rootPackageName: this.answers.rootPackageName
            }
        )

    }

    end() {
    }
};
