var Generator = require('yeoman-generator');
var chalk = require('chalk');
var slugify = require('slugify')

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
    this.argument('appname', { type: String, required: false });
  }

  // Async Await
  async prompting() {
    this.answers = await this.prompt([{
      type: 'input',
      name: 'appName',
      message: 'Your project name?',
      store: true,
    },
    {
      type: 'list',
      name: 'generatorType',
      message: 'Was soll generiert werden?',
      choices: ['Skeleton', 'slices']
    }]);
  }

  install() {
    this.npmInstall();
  }

  writing() {
    if (this.answers.generatorType === 'Skeleton') {
      this._writeReactSkeleton();
    } else if (this.answers.generatorType === 'slices') {
      this.log(chalk.green('starting commands generation'))
      this.composeWith(require.resolve('../slices'), {answers: this.answers, appName : this.answers.appName??this.appName});
    }
  }

  _writeReactSkeleton() {
    this.fs.copy(
         this.templatePath(''),
         this.destinationPath(slugify(this.answers.appName))
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
