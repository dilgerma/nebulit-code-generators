/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')

var config = {}

/**
 * Convert a title to PascalCase
 */
function pascalCase(title) {
    if (!title) return '';
    return title
        .split(/[\s-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

/**
 * Map field type to TypeScript type
 */
function typeMapping(fieldType, fieldCardinality) {
    let tsType;
    switch (fieldType?.toLowerCase()) {
        case "string":
            tsType = "string";
            break;
        case "double":
        case "decimal":
            tsType = "number";
            break;
        case "long":
        case "int":
        case "integer":
            tsType = "number";
            break;
        case "boolean":
            tsType = "boolean";
            break;
        case "date":
        case "datetime":
            tsType = "Date";
            break;
        case "uuid":
            tsType = "string";
            break;
        case "custom":
            tsType = "any";
            break;
        default:
            tsType = "any";
            break;
    }
    if (fieldCardinality?.toLowerCase() === "list") {
        return `${tsType}[]`;
    }
    return tsType;
}

/**
 * Render fields for a TypeScript type
 */
function renderFields(element, indent = '\t') {
    if (!element.fields || element.fields.length === 0) return '';
    return element.fields
        .map(field => `${indent}${field.name}: ${typeMapping(field.type, field.cardinality)};`)
        .join('\n');
}

/**
 * Get unique items by key function
 */
function uniqBy(array, keyFn) {
    const seen = new Set();
    return array.filter(item => {
        const key = keyFn(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers;
        /**
         * Load the exported config json from the
         * current Working Directory
         */
        config = require(this.env.cwd + "/config.json");
    }

    async prompting() {
        // Get all available elements
        const allEvents = config.slices.flatMap(slice => slice.events || []).filter(e => e.title);
        const allCommands = config.slices.flatMap(slice => slice.commands || []).filter(c => c.title);
        const allReadModels = config.slices.flatMap(slice => slice.readmodels || []).filter(r => r.title);

        this.answers = await this.prompt([
            {
                type: 'checkbox',
                name: 'generate',
                message: 'What do you want to generate?',
                choices: ['events', 'commands', 'readmodels', 'all'],
                default: ['all']
            },
            {
                type: 'checkbox',
                name: 'events',
                message: 'Which events should be generated?',
                choices: uniqBy(allEvents, e => e.title).map(e => e.title),
                when: (answers) => answers.generate.includes('events') || answers.generate.includes('all')
            },
            {
                type: 'checkbox',
                name: 'commands',
                message: 'Which commands should be generated?',
                choices: uniqBy(allCommands, c => c.title).map(c => c.title),
                when: (answers) => answers.generate.includes('commands') || answers.generate.includes('all')
            },
            {
                type: 'checkbox',
                name: 'readmodels',
                message: 'Which read models should be generated?',
                choices: uniqBy(allReadModels, r => r.title).map(r => r.title),
                when: (answers) => answers.generate.includes('readmodels') || answers.generate.includes('all')
            }
        ]);
    }

    /**
     * Generate events
     */
    createEvents() {
        if (!this.answers.events || this.answers.events.length === 0) return;

        const allEvents = config.slices.flatMap(slice => slice.events || []);

        this.answers.events.forEach(eventTitle => {
            const event = allEvents.find(e => e.title === eventTitle);
            if (!event) return;

            const eventName = pascalCase(event.title);
            const aggregate = event.aggregate || 'Unknown';

            this.fs.copyTpl(
                this.templatePath('src/components/events.tpl'),
                this.destinationPath(`./generated/events/${eventName}.ts`),
                {
                    _name: eventName,
                    _aggregate: aggregate,
                    _fields: renderFields(event)
                }
            );
        });

        // Generate events union/index file
        const selectedEvents = this.answers.events.map(title => {
            const event = allEvents.find(e => e.title === title);
            return event ? pascalCase(event.title) : null;
        }).filter(Boolean);

        if (selectedEvents.length > 0) {
            this.fs.copyTpl(
                this.templatePath('src/components/eventsIndex.tpl'),
                this.destinationPath('./generated/events/index.ts'),
                {
                    _events: selectedEvents
                }
            );
        }
    }

    /**
     * Generate commands
     */
    createCommands() {
        if (!this.answers.commands || this.answers.commands.length === 0) return;

        const allCommands = config.slices.flatMap(slice => slice.commands || []);

        this.answers.commands.forEach(commandTitle => {
            const command = allCommands.find(c => c.title === commandTitle);
            if (!command) return;

            const commandName = pascalCase(command.title);
            const aggregate = command.aggregate || 'Unknown';

            // Find resulting events for this command
            const resultingEvents = (command.dependencies || [])
                .filter(dep => dep.type === 'OUTBOUND' && dep.elementType === 'EVENT')
                .map(dep => pascalCase(dep.title));

            this.fs.copyTpl(
                this.templatePath('src/components/commands.tpl'),
                this.destinationPath(`./generated/commands/${commandName}Command.ts`),
                {
                    _name: commandName,
                    _aggregate: aggregate,
                    _fields: renderFields(command),
                    _resultingEvents: resultingEvents
                }
            );
        });
    }

    /**
     * Generate read models
     */
    createReadModels() {
        if (!this.answers.readmodels || this.answers.readmodels.length === 0) return;

        const allReadModels = config.slices.flatMap(slice => slice.readmodels || []);
        const allEvents = config.slices.flatMap(slice => slice.events || []);

        this.answers.readmodels.forEach(readModelTitle => {
            const readModel = allReadModels.find(r => r.title === readModelTitle);
            if (!readModel) return;

            const readModelName = pascalCase(readModel.title);
            const aggregate = readModel.aggregate || 'Unknown';
            const isListElement = readModel.listElement || false;

            // Find inbound events for this read model
            const inboundEvents = (readModel.dependencies || [])
                .filter(dep => dep.type === 'INBOUND' && dep.elementType === 'EVENT')
                .map(dep => {
                    const event = allEvents.find(e => e.id === dep.id);
                    return event ? pascalCase(event.title) : pascalCase(dep.title);
                });

            this.fs.copyTpl(
                this.templatePath('src/components/readmodel.tpl'),
                this.destinationPath(`./generated/readmodels/${readModelName}ReadModel.ts`),
                {
                    _name: readModelName,
                    _aggregate: aggregate,
                    _fields: renderFields(readModel),
                    _isListElement: isListElement,
                    _inboundEvents: inboundEvents
                }
            );
        });
    }

    end() {
        this.log('Generation complete!');
    }
}