var slugify = require('slugify')
var {capitalizeFirstCharacter} = require("./util")

function _aggregateTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "")}Aggregate`
}

function _commandTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "")}Command`
}

function _sliceTitle(title) {
    return slugify(title.replaceAll(" ","").replace("slice:", "")).replaceAll("-", "").toLowerCase()
}



function _processorTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "")}Processor`
}

function _restResourceTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "")}Ressource`
}

function _readmodelTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "")}ReadModel`
}

function _eventTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "")}Event`
}

function _screenTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "")}`
}



module.exports = {_processorTitle, _restResourceTitle, _readmodelTitle, _eventTitle, _commandTitle, _aggregateTitle, _screenTitle, _sliceTitle}
