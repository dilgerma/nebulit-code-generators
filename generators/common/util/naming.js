var slugify = require('slugify')
var {capitalizeFirstCharacter} = require("./util")

function _aggregateTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}Aggregate`
}

function _commandTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}Command`
}

function _sliceTitle(title) {
    return slugify(title.replace("slice:", "")).replaceAll("-", "").toLowerCase()
}



function _processorTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}Processor`
}

function _restResourceTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}Ressource`
}

function _readmodelTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}ReadModel`
}

function _eventTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}Event`
}

function _screenTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title), "")}`
}



module.exports = {_processorTitle, _restResourceTitle, _readmodelTitle, _eventTitle, _commandTitle, _aggregateTitle, _screenTitle, _sliceTitle}
