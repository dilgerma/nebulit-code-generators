var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')
const {_screenTitle, _sliceTitle, _processorTitle} = require("../../common/util/naming");

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
            type: 'input',
            name: 'appName',
            message: 'Projektname?',
            when: () => !config?.codeGen?.application,
        }]);
    }

    setDefaults() {
        if (!this.answers.appName) {
            this.answers.appName = config?.codeGen?.application + "Prototype"
        }
    }

    writing() {

        this._writeReactSkeleton();
        this.composeWith(require.resolve('../aggregates'), {
            answers: this.answers,
            appName: this.answers.appName ?? this.appName
        });
        this.composeWith(require.resolve('../events'), {
            answers: this.answers,
            appName: this.answers.appName ?? this.appName
        });
        this.composeWith(require.resolve('../slices'), {
            answers: this.answers,
            appName: this.answers.appName ?? this.appName
        });
    }

    _writeReactSkeleton() {

        var sliceViews = config.slices.flatMap((slice) => {
            return slice.screens?.map((screen) => {
                var componentName = _screenTitle(screen.title)
                return `
                          {
                              "slice":"${_sliceTitle(slice.title)}",
                              "viewType":"${componentName}",
                              "viewName" : "${_sliceTitle(slice.title)}/${componentName}",
                              "view" : ${_sliceTitle(slice.title)}${componentName}
                          }`
            })

        }).join(",")

        var processorViews = config.slices.flatMap((slice) => {
            return slice.processors?.map((processor) => {
                var componentName = _processorTitle(processor.title)
                return `
                                 {
                                     "slice":"${_sliceTitle(slice.title)}",
                                     "processorType":"${componentName}",
                                     "processorName" : "${_sliceTitle(slice.title)}/${componentName}",
                                     "view" : ${_sliceTitle(slice.title)}${componentName}
                                 }`
            })

        }).join(",")

        var componentImports = config.slices.flatMap((slice) => {
            var screens = slice.screens?.map((screen) => {
                var componentName = _screenTitle(screen.title)
                var sliceName = _sliceTitle(slice.title)
                return `import ${sliceName}${componentName} from '@/app/components/slices/${sliceName}/${componentName}';
                      `
            })
            var processors = slice.processors?.map((processor) => {
                var componentName = _processorTitle(processor.title)
                var sliceName = _sliceTitle(slice.title)
                return `import ${sliceName}${componentName} from '@/app/components/slices/${sliceName}/${componentName}';
                                 `
            })

            return screens.concat(processors)

        }).join("\n")


        this.fs.copyTpl(
            this.templatePath('root'),
            this.destinationPath(slugify(this.answers.appName)),
            {
                rootPackageName: this.answers.rootPackageName,
                appName: this.answers.appName,
                _views: sliceViews,
                _processors: processorViews,
                _imports: componentImports
            }
        )

        this.fs.copyTpl(
            this.templatePath('git/gitignore'),
            this.destinationPath(`${slugify(this.answers.appName)}/.gitignore`),
            {
                rootPackageName: this.answers.rootPackageName
            }
        )

    }

    end() {
        this.log(chalk.green('------------'))
        this.log(chalk.magenta('***---***'))
        this.log(chalk.blue('Jobs is Done!'))
        this.log(chalk.green('------------'))
        this.log(chalk.magenta('***---***'))
    }
};
