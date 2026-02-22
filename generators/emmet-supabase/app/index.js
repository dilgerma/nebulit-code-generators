/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator').default;
var slugify = require('slugify');

var config = {}

module.exports = class extends Generator {

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

    async prompting() {
        this.answers = await this.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What do you want to generate?',
                choices: [
                    {name: 'Skeleton App', value: 'skeleton'},
                    {name: 'State Change Slice', value: 'STATE_CHANGE'},
                    {name: 'State View Slice', value: 'STATE_VIEW'},
                    {name: 'Automation Slice', value: 'AUTOMATION'},
                ]
            }
        ]);

        if (this.answers.action === 'skeleton') {
            const skeletonAnswers = await this.prompt([
                {
                    type: 'input',
                    name: 'appName',
                    message: 'Project name?',
                    default: config?.codeGen?.application ?? 'my-app',
                }
            ]);
            this.answers = {...this.answers, ...skeletonAnswers};
        } else {
            const sliceAnswers = await this.prompt([
                {
                    type: 'checkbox',
                    name: 'slices',
                    message: 'Which slices should be generated?',
                    choices: config.slices
                        .filter(slice => slice.sliceType === this.answers.action)
                        .map(slice => ({
                            name: slice.title,
                            value: slice.id
                        }))
                }
            ]);
            this.answers = {...this.answers, ...sliceAnswers};
        }
    }

    writing() {
        if (this.answers.action === 'skeleton') {
            this._generateSkeleton();
        } else {
            this._generateSlices();
        }
    }

    _generateSkeleton() {
        const appName = this.answers.appName;

        this.log(`Generating skeleton app: ${appName}`);

        this.fs.copy(
            this.templatePath('root/**/*'),
            this.destinationPath("."),
            {globOptions: {dot: true}}
        );
    }

    _generateSlices() {
        this.answers.slices?.forEach((sliceId) => {
            const slice = config.slices.find(s => s.id === sliceId);
            if (!slice) return;

            this.log(`Generating slice: ${slice.title} (${slice.sliceType})`);

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
                    this.log(`Unknown slice type: ${slice.sliceType}`);
            }
        });
    }

    _generateStateChangeSlice(slice) {
        const sliceName = this._getSliceName(slice.title);
        const command = slice.commands?.[0];

        if (!command) {
            this.log(`No command found for slice: ${slice.title}`);
            return;
        }

        const event = slice.events?.[0];
        const commandName = this._toPascalCase(command.title);
        const eventName = event ? this._toPascalCase(event.title) : `${commandName}ed`;

        this.fs.copyTpl(
            this.templatePath('state-change/CommandHandler.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/${commandName}Command.ts`),
            {commandName, eventName, fields: command.fields || [], typeMapping: this._typeMapping.bind(this)}
        );

        this.fs.copyTpl(
            this.templatePath('state-change/Command.test.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/${commandName}.test.ts`),
            {commandName, eventName, fields: command.fields || [], typeMapping: this._typeMapping.bind(this)}
        );

        this.fs.copyTpl(
            this.templatePath('state-change/routes.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/routes.ts`),
            {commandName, sliceName: this._toLowerCaseWithDash(command.title), fields: command.fields || [], typeMapping: this._typeMapping.bind(this)}
        );
    }

    _generateStateViewSlice(slice) {
        const sliceName = this._getSliceName(slice.title);
        const readModel = slice.readModels?.[0] || {title: slice.title};
        const readModelName = this._toPascalCase(readModel.title);
        const tableName = this._toSnakeCase(readModel.title);
        const events = slice.events || [];

        this.fs.copyTpl(
            this.templatePath('state-view/Projection.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/${readModelName}Projection.ts`),
            {readModelName, tableName, events, fields: readModel.fields || [], typeMapping: this._typeMapping.bind(this), toPascalCase: this._toPascalCase.bind(this)}
        );

        this.fs.copyTpl(
            this.templatePath('state-view/Projection.test.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/${readModelName}.test.ts`),
            {readModelName, tableName, events, fields: readModel.fields || [], typeMapping: this._typeMapping.bind(this), toPascalCase: this._toPascalCase.bind(this)}
        );

        this.fs.copyTpl(
            this.templatePath('state-view/routes.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/routes.ts`),
            {readModelName, tableName, collectionName: this._toLowerCaseWithDash(readModel.title)}
        );

        const migrationNumber = this._getNextMigrationNumber();
        this.fs.copyTpl(
            this.templatePath('state-view/migration.sql.tpl'),
            this.destinationPath(`supabase/migrations/V${migrationNumber}__${tableName}.sql`),
            {tableName, fields: readModel.fields || [], sqlTypeMapping: this._sqlTypeMapping.bind(this)}
        );
    }

    _generateAutomationSlice(slice) {
        const sliceName = this._getSliceName(slice.title);
        const command = slice.commands?.[0];

        if (!command) {
            this.log(`No command found for automation slice: ${slice.title}`);
            return;
        }

        const commandName = this._toPascalCase(command.title);
        const todoList = slice.dependencies?.find(d => d.type === 'INBOUND');
        const todoListEndpoint = todoList ? this._toLowerCaseWithDash(todoList.title) : 'todo-items';

        this._generateStateChangeSlice(slice);

        this.fs.copyTpl(
            this.templatePath('automation/processor.ts.tpl'),
            this.destinationPath(`src/slices/${sliceName}/processor.ts`),
            {commandName, todoListEndpoint, fields: command.fields || []}
        );
    }

    _getSliceName(title) {
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
        return slugify(str, {lower: true, strict: true});
    }

    _toSnakeCase(str) {
        return slugify(str, {lower: true, replacement: '_', strict: true});
    }

    _typeMapping(fieldType, fieldCardinality) {
        let tsType;
        switch (fieldType?.toLowerCase()) {
            case "string": tsType = "string"; break;
            case "double":
            case "long":
            case "int": tsType = "number"; break;
            case "boolean": tsType = "boolean"; break;
            case "date": tsType = "Date"; break;
            case "uuid": tsType = "string"; break;
            default: tsType = "string"; break;
        }
        return fieldCardinality?.toLowerCase() === "list" ? `${tsType}[]` : tsType;
    }

    _sqlTypeMapping(fieldType, fieldCardinality) {
        let sqlType;
        switch (fieldType?.toLowerCase()) {
            case "string":
            case "uuid": sqlType = "TEXT"; break;
            case "double": sqlType = "DOUBLE PRECISION"; break;
            case "long": sqlType = "BIGINT"; break;
            case "int": sqlType = "INTEGER"; break;
            case "boolean": sqlType = "BOOLEAN"; break;
            case "date": sqlType = "TIMESTAMP"; break;
            default: sqlType = "TEXT"; break;
        }
        return fieldCardinality?.toLowerCase() === "list" ? `${sqlType}[]` : sqlType;
    }

    _getNextMigrationNumber() {
        return "99";
    }
}
