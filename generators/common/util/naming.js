var slugify = require('slugify')
var {capitalizeFirstCharacter} = require("./util")

function _aggregateTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "").replaceAll("-","")}Aggregate`
}

function _commandTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "").replaceAll("-","")}Command`
}

function _sliceTitle(title) {
    return slugify(title.replaceAll(" ","").replace("slice:", "")).replaceAll("-", "").toLowerCase()
}



function _processorTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "").replaceAll("-","")}Processor`
}

function _restResourceTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "").replaceAll("-","")}Ressource`
}

function _readmodelTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "").replaceAll("-","")}ReadModel`
}

function _eventTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","")), "").replaceAll("-","")}Event`
}

function _screenTitle(title) {
    return `${slugify(capitalizeFirstCharacter(title.replaceAll(" ","").replaceAll("-","")), "")}`
}



module.exports = {_processorTitle, _restResourceTitle, _readmodelTitle, _eventTitle, _commandTitle, _aggregateTitle, _screenTitle, _sliceTitle}
