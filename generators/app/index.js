/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');

module.exports = class extends Generator {

    appName = "."

    opts = null

    constructor(args, opts) {
        super(args, opts);
        this.opts = opts
        this.argument('appname', {type: String, required: false});
    }

    // Async Await
    async prompting() {
        if (!this.opts.generator) {
            this.answers = await this.prompt([{
                type: 'list',
                name: 'generator',
                message: 'Which generator?',
                // choices: ["springboot", "axon","nextjs-prototype","typescript-prototype","eventcatalog"]
                choices: ["axon", "emmet (experimental)", "sample-generator", "eventcatalog (experimental)", "live-prototype", "nextjs-prototype", "open-api"],
                default: "axon"
            }]);
        } else {
            this.answers = {"generator": this.opts.generator}
        }
    }


    generators() {

        this.composeWith(require.resolve(`../${this.answers.generator}/app`), {
            answers: this.answers,
            appName: this.answers.appName ?? this.appName,
            ...this.opts
        });
    }

};
