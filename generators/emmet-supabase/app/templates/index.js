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
                name: 'slices',
                message: 'Which slices should be generated?',
                choices: config.slices.map(slice => ({
                    name: `${slice.title} (${slice.sliceType})`,
                    value: slice.id
                }))
            }
        ]);
    }

    /**
     * this runs automatically, since it does not start with "_"
     */
    createElements() {
        this.answers.slices?.forEach((sliceId) => {
            const slice = config.slices.find(s => s.id === sliceId);

            if (!slice) return;

            console.log(`Generating slice: ${slice.title} (${slice.sliceType})`);

            switch (slice.sliceType) {
                case 'STATE_CHANGE':
                    this._generateStateChangeSlice(slice);
                    break;
                case 'STATE_VIEW':
                    this._generateStateViewSlice(slice);
                    break;
                case 'AUTOMATION':
                    this._generateAutomationSlice(slice);
                    break;
                default:
                    console.warn(`Unknown slice type: ${slice.sliceType}`);
            }
        });
    }

    _generateStateChangeSlice(slice) {
        const sliceName = this._getSliceName(slice.title);
        const command = slice.commands?.[0];

        if (!command) {
            console.warn(`No command found for slice: ${slice.title}`);
            return;
        }

        const event = slice.events?.[0];
        const commandName = this._toPascalCase(command.title);
        const eventName = event ? this._toPascalCase(event.title) : `${commandName}ed`;

        // Generate Command Handler
        this.fs.copyTpl(
            this.templatePath('state-change/CommandHandler.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/${commandName}Command.ts`),
            {
                commandName,
                eventName,
                fields: command.fields || [],
                typeMapping: this._typeMapping.bind(this)
            }
        );

        // Generate Tests
        this.fs.copyTpl(
            this.templatePath('state-change/Command.test.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/${commandName}.test.ts`),
            {
                commandName,
                eventName,
                fields: command.fields || [],
                typeMapping: this._typeMapping.bind(this)
            }
        );

        // Generate Routes
        this.fs.copyTpl(
            this.templatePath('state-change/routes.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/routes.ts`),
            {
                commandName,
                sliceName: this._toLowerCaseWithDash(command.title),
                fields: command.fields || [],
                typeMapping: this._typeMapping.bind(this)
            }
        );
    }

    _generateStateViewSlice(slice) {
        const sliceName = this._getSliceName(slice.title);
        const readModel = slice.readModels?.[0] || { title: slice.title };
        const readModelName = this._toPascalCase(readModel.title);
        const tableName = this._toSnakeCase(readModel.title);
        const events = slice.events || [];

        // Generate Projection
        this.fs.copyTpl(
            this.templatePath('state-view/Projection.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/${readModelName}Projection.ts`),
            {
                readModelName,
                tableName,
                events,
                fields: readModel.fields || [],
                typeMapping: this._typeMapping.bind(this),
                toPascalCase: this._toPascalCase.bind(this)
            }
        );

        // Generate Tests
        this.fs.copyTpl(
            this.templatePath('state-view/Projection.test.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/${readModelName}.test.ts`),
            {
                readModelName,
                tableName,
                events,
                fields: readModel.fields || [],
                typeMapping: this._typeMapping.bind(this),
                toPascalCase: this._toPascalCase.bind(this)
            }
        );

        // Generate Routes
        this.fs.copyTpl(
            this.templatePath('state-view/routes.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/routes.ts`),
            {
                readModelName,
                tableName,
                collectionName: this._toLowerCaseWithDash(readModel.title)
            }
        );

        // Generate Migration
        const migrationNumber = this._getNextMigrationNumber();
        this.fs.copyTpl(
            this.templatePath('state-view/migration.sql.tpl'),
            this.destinationPath(`supabase/migrations/V${migrationNumber}__${tableName}.sql`),
            {
                tableName,
                fields: readModel.fields || [],
                sqlTypeMapping: this._sqlTypeMapping.bind(this)
            }
        );
    }

    _generateAutomationSlice(slice) {
        const sliceName = this._getSliceName(slice.title);
        const command = slice.commands?.[0];

        if (!command) {
            console.warn(`No command found for automation slice: ${slice.title}`);
            return;
        }

        const commandName = this._toPascalCase(command.title);
        const todoList = slice.dependencies?.find(d => d.type === 'INBOUND');
        const todoListEndpoint = todoList ? this._toLowerCaseWithDash(todoList.title) : 'todo-items';

        // Generate Command Handler (same as state-change)
        this._generateStateChangeSlice(slice);

        // Generate Processor
        this.fs.copyTpl(
            this.templatePath('automation/processor.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/processor.ts`),
            {
                commandName,
                todoListEndpoint,
                fields: command.fields || []
            }
        );
    }

    _getSliceName(title) {
        // Remove "slice: " prefix and convert to PascalCase
        const cleanTitle = title.replace(/^slice:\s*/i, '').trim();
        return this._toPascalCase(cleanTitle);
    }

    _toPascalCase(str) {
        return slugify(str, '')
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    _toLowerCaseWithDash(str) {
        return slugify(str, { lower: true, strict: true });
    }

    _toSnakeCase(str) {
        return slugify(str, { lower: true, replacement: '_', strict: true });
    }

    _typeMapping(fieldType, fieldCardinality) {
        let tsType;
        switch (fieldType?.toLowerCase()) {
            case "string":
                tsType = "string";
                break;
            case "double":
            case "long":
            case "int":
                tsType = "number";
                break;
            case "boolean":
                tsType = "boolean";
                break;
            case "date":
                tsType = "Date";
                break;
            case "uuid":
                tsType = "string";
                break;
            default:
                tsType = "string";
                break;
        }

        if (fieldCardinality?.toLowerCase() === "list") {
            return `${tsType}[]`;
        }
        return tsType;
    }

    _sqlTypeMapping(fieldType, fieldCardinality) {
        let sqlType;
        switch (fieldType?.toLowerCase()) {
            case "string":
            case "uuid":
                sqlType = "TEXT";
                break;
            case "double":
                sqlType = "DOUBLE PRECISION";
                break;
            case "long":
                sqlType = "BIGINT";
                break;
            case "int":
                sqlType = "INTEGER";
                break;
            case "boolean":
                sqlType = "BOOLEAN";
                break;
            case "date":
                sqlType = "TIMESTAMP";
                break;
            default:
                sqlType = "TEXT";
                break;
        }

        if (fieldCardinality?.toLowerCase() === "list") {
            return `${sqlType}[]`;
        }
        return sqlType;
    }

    _getNextMigrationNumber() {
        // This would need to scan existing migrations
        // For now, return a placeholder
        return "99";
    }
}
