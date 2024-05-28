var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')
const {answers} = require("../app");
const {givenAnswers} = require("./index");

let config = {}


module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");
    }

    init() {
    }

    async prompting() {
        this.answers = await this.prompt([
            {
                type: 'confirm',
                name: 'config',
                message: 'Before you start, copy the JSON configuration from the Miro plugin into your local working directory.',
            },
            {
                type: 'confirm',
                name: 'generator',
                message: 'The generator expects the configuration in the root of the project for generation.',
            }, {
                type: 'confirm',
                name: 'appName',
                message: 'First, you will answer some questions about the application (name of the service, root package, etc.',
            },
            {
                type: 'confirm',
                name: 'generatorType',
                message: 'Next, you will be asked what you want to generate - Skeleton (the base application), Slices (with further selection of which slice), and Aggregates (the aggregate or aggregates defined in the model).',
            },

            {
                type: 'confirm',
                name: 'generatorType',
                message: 'Next, you will be asked what you want to generate - Skeleton (the base application), Slices (with further selection of which slice), and Aggregates (the aggregate or aggregates defined in the model).',
            },
            {
                type: 'confirm',
                name: 'context',
                message: 'If you have defined contexts in the model, you will then select the contexts that are relevant for the generation. This is usually the case if you have defined multiple models on a Miro board.',
            },
            {
                type: 'confirm',
                name: 'slice',
                message: 'Next, you select the slice you want to generate (the selection is limited to the context if you have chosen one).',
            },
            {
                type: 'confirm',
                name: 'restendpoint',
                message: 'For State Change / State View slices, REST endpoints can be generated. The default is "y".'
            },
            {
                type: 'confirm',
                name: 'aggregate',
                message: `Next, you select the aggregates to be generated. The selection is limited to the aggregates defined in the model.`,
            }, {
                type: 'confirm',
                name: 'specifications',
                loop: false,
                message: 'Next, you choose the aggregates to generate. Your options are restricted to the aggregates defined in the model.',
            }, {
                type: 'confirm',
                name: 'processTriggers',
                message: 'In one of the final steps, you define whether automations should be created. These are processors typically triggered by events or read models.'
            }
        ]);
    }
}
