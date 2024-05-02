var Generator = require('yeoman-generator');
const renderSwitchStatement = require("../common/tools")
const {uniqBy} = require("../../common/util/util");
const {variables, variablesDefaults, renderUnionTypes, renderImports} = require("../common/domain");
const {_aggregateTitle, _eventTitle} = require("../../common/util/naming")
let config = {}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");
    }

    writeEvents() {
        config?.aggregates?.forEach((aggregate) => {
            this._writeEvents(aggregate)
        });
    }

    _writeEvents(aggregate) {

        let events = uniqBy(config?.slices?.flatMap(it => it.events).filter(it => it.aggregate === aggregate.title), (item) => item.title)

        events.forEach((event) => {
            this.fs.copyTpl(
                this.templatePath(`Event.ts.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/app/components/events/${_aggregateTitle(aggregate?.title)}/${_eventTitle(event?.title)}.ts`),
                {
                    _eventTitle: _eventTitle(event?.title),
                    _fields: variables([event]),

                }
            )
        })
        if (events.length > 0) {

            this.fs.copyTpl(
                this.templatePath(`AggregateEvent.ts.tpl`),
                this.destinationPath(`${this.givenAnswers?.appName}/app/components/events/${_aggregateTitle(aggregate?.title)}/${_aggregateTitle(aggregate?.title)}Events.ts`),
                {
                    _aggregateName: _aggregateTitle(aggregate?.title),
                    _unionTypeDefinition: renderUnionTypes(events.map(it => _eventTitle(it.title))),
                    _imports: renderImports(`@/app/components/events/${_aggregateTitle(aggregate?.title)}`, events.map(it => _eventTitle(it.title)))
                }
            );
        }


    }


};
