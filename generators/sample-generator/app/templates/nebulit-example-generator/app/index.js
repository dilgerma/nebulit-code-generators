/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')

var config = {}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        /**
         * Load the exported config json from the
         * current Working Directory
         */
        config = require(this.env.cwd + "/config.json");
    }

    async prompting() {

        /**
         * configure prompts.
         */
        this.answers = await this.prompt([
            {
                type: 'checkbox',
                name: 'events',
                message: 'which events should be generated?',
                choices: config.slices.flatMap(item => item.events).map(item => item.title),
                //when: (answers) => answers.elementType === "events"
            }]);
    }


    /**
     * this runs automatically, since it does not start with "_"
     */
    createElements() {

        this.answers.events?.forEach((eventTitle) => {
            var event = config.slices.flatMap(it => it.events).find(it => it.title === eventTitle)
            if (event) {

                let eventName = slugify(event.title, "")
                this.fs.copyTpl(
                    this.templatePath(`src/components/events.tpl`),
                    this.destinationPath(`./demo/events/${eventName}.ts`),
                    {
                        //vars
                        _name: eventName,
                        _fields: renderFields(event)
                    }
                )
            }
        })
    }
}

const renderFields = (element) => {
    return element.fields ? `
${element.fields?.map(item => {
        return `\t${item.name}:${typeMapping(item.type, item.cardinality)}`
    }).join(",\n")}    
    ` : ''
}

const typeMapping = (fieldType, fieldCardinality) => {
    var fieldType;
    switch (fieldType?.toLowerCase()) {
        case "string":
            fieldType = "string";
            break
        case "double":
            fieldType = "number";
            break
        case "long":
            fieldType = "number";
            break
        case "int":
            fieldType = "number";
            break
        case "boolean":
            fieldType = "boolean";
            break
        case "date":
            fieldType = "date";
            break
        case "uuid":
            fieldType = "string";
            break
        default:
            fieldType = "string";
            break
    }
    if (fieldCardinality?.toLowerCase() === "list") {
        return `${fieldType}[]`
    } else {
        return fieldType
    }

}