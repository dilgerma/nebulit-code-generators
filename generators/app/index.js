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
            type: 'list',
            name: 'generator',
            message: 'Welcher Generator?',
            choices: ["springboot","typescript-prototype","eventcatalog"]
        }]);
    }


    generators() {

        this.composeWith(require.resolve(`../${this.answers.generator}/app`), {
            answers: this.answers,
            appName: this.answers.appName ?? this.appName
        });
    }

};
