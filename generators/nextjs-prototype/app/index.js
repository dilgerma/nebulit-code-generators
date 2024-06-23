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
            message: 'Projectname?',
            when: () => !config?.codeGen?.application,
        },
            {
                type: 'checkbox',
                name: 'slices',
                choices: config.slices.map(it => it.title),
                loop: false,
                message: 'Which Slice should be generated?'
            }]);

    }

    setDefaults() {
        if (!this.answers.appName) {
            this.answers.appName = config?.codeGen?.application + "Prototype"
        }
    }

    writing() {
        this._writeReactSkeleton();
        this.composeWith(require.resolve('../slices'), {
            answers: this.answers,
            appName: this.answers.appName ?? this.appName
        });
    }

    _writeReactSkeleton() {

        var sliceViews = this.answers.slices.flatMap((sliceName) => {
            var slice = config.slices.find(it => it.title === sliceName)
            var screens = this._findScreensForSlice(slice)

            return screens?.map((screen) => {
                return `
                          {
                              "slice":"${_sliceTitle(slice.title)}",
                              "viewType":"${screen}",
                              "viewName" : "${_sliceTitle(slice.title)}/${screen}",
                              "commandView" : ${_sliceTitle(slice.title)}${screen}
                          }`
            })

        }).join(",")

        var componentImports = this.answers.slices.flatMap((sliceName) => {
            var slice = config.slices.find(it => it.title === sliceName)
            var screens = this._findScreensForSlice(slice)
            return screens?.map((screen) => {
                var sliceName = _sliceTitle(slice.title)
                return `import ${sliceName}${screen} from '@/app/components/slices/${sliceName}/${screen}';
                      `
            })

        }).join("\n")


        this.fs.copyTpl(
            this.templatePath('root'),
            this.destinationPath(slugify(this.answers.appName)),
            {
                rootPackageName: this.answers.rootPackageName,
                appName: this.answers.appName,
                _views: sliceViews,
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
    }

    _findScreensForSlice(slice) {
        var screenNames = slice.screens.map(it => _screenTitle(it.title))

        return screenNames
    }
};


