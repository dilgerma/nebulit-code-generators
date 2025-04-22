/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');

let config = {}

module.exports = class extends Generator {

    defaultAppName = "app"

    constructor(args, opts) {
        super(args, opts);
    }

    writing() {
        this.fs.copyTpl(
            this.templatePath('nebulit-example-generator'),
            this.destinationPath(".generator"),
            {}
        )
    }


    end() {
    }
};
