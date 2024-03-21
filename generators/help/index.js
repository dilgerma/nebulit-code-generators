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
                message: 'Bevor du startest kopierst du dir die JSON-Konfiguration aus dem Miro Plugin in dein lokales Arbeitsverzeichnis.',
                store: true,
            },
            {
                type: 'confirm',
                name: 'generator',
                message: 'Der Generator erwartet die Konfiguration im Root des Projektes für die Generierung.',
                store: true,
            }, {
                type: 'confirm',
                name: 'appName',
                message: 'Zuerst wirst du einige Fragen zur Anwendung beantworten (Name des Service, Root Package etc.)?',
                store: true,
            },
            {
                type: 'confirm',
                name: 'generatorType',
                message: 'Anschließend wirst du gefragt, was du generieren möchtest - Skeleton (die Basisanwendung), Slices (mit weiterer Auswahl, welches Slice und Aggregates (das oder die Aggregate, die im Modell definiert sind)',
            },

            {
                type: 'confirm',
                name: 'generatorType',
                message: 'Anschließend wirst du gefragt, was du generieren möchtest - Skeleton (die Basisanwendung), Slices (mit weiterer Auswahl, welches Slice und Aggregates (das oder die Aggregate, die im Modell definiert sind)',
            },
            {
                type: 'confirm',
                name: 'context',
                message: 'Falls du Kontexte im Modell definiert hast wählst du dann die Kontexte aus, die für die Generierung relevant sind. Dies ist meist der Fall wenn du mehrere Modell in einem Miro Board definiert hast.',
            },
            {
                type: 'confirm',
                name: 'slice',
                message: 'Anschließend wählst du den Slice aus, den du generieren möchtest (die Auswahl ist auf den Kontext begrenzt ,falls du einen gewählt hast)',
            },
            {
                type: 'confirm',
                name: 'restendpoint',
                message: 'Für State Change / State View Slices können Rest Endpunkte generiert werden. Der Default ist "y".'
            },
            {
                type: 'confirm',
                name: 'aggregate',
                message: `Anschließend wählst die die Aggregate die generiert werden sollen. Die Auswahl begrenzt sich auf die im Modell definierten Aggregate.`,
            }, {
                type: 'confirm',
                name: 'specifications',
                loop: false,
                message: 'Im nächsten Schritt definierst du, ob Testcases aus den Specifications generiert werden sollen.',
            }, {
                type: 'confirm',
                name: 'processTriggers',
                message: 'In einem der letzten Schritte definierst du, ob Automatisierungen erstellt werden sollen. Das sind Prozessoren die typischerweise von Events oder ReadModels getriggert werden.'
            }
        ]);
    }
}
