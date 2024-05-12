var Generator = require('yeoman-generator');
var chalk = require('chalk');
const {renderSwitchStatement,renderLoadFromStream} = require("../common/tools")
const slugify = require('slugify')

const {uniqBy} = require("../../common/util/util");
const {variables, variablesDefaults, variableAssignments} = require("../common/domain");
const {_aggregateTitle} = require("../../common/util/naming")
let config = {}


module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");
    }

    writeAggregates() {
        config?.aggregates?.forEach((aggregate) => {
            this._writeAggregates(aggregate)
        });
    }

    _writeAggregates(aggregate) {

        let events = uniqBy(config?.slices?.flatMap(it => it.events).filter(it => it.aggregate === aggregate.title), (item) => item.title)

        this.fs.copyTpl(
            this.templatePath(`Aggregate.ts.tpl`),
            this.destinationPath(`${slugify(this.givenAnswers?.appName)}/app/components/domain/${_aggregateTitle(aggregate?.title)}.ts`),
            {
                _aggregateName: _aggregateTitle(aggregate.title),
                _fields: variables([aggregate]),
                _fieldDefaults: variablesDefaults([aggregate]),
                _switchStatement: renderSwitchStatement(aggregate, "type", "state", events, (aggregate, event) => {
                    return variableAssignments(event, "data", aggregate, ",\n", ":")
                })

            }
        )

    }


};
