/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var slugify = require('slugify')
var {capitalizeFirstCharacter} = require("./util")

function _aggregateTitle(title) {
    var titleElements = title.split(" ").map(it => capitalizeFirstCharacter(it.replaceAll("-", ""))).join("")
    return `${slugify(capitalizeFirstCharacter(titleElements.replaceAll(" ", "")), "").replaceAll("-", "")}${!title?.endsWith("Aggregate") ? "Aggregate" : ""}`
}

function _commandTitle(title) {
    var titleElements = title.split(" ").map(it => capitalizeFirstCharacter(it.replaceAll("-", ""))).join("")
    return `${slugify(capitalizeFirstCharacter(titleElements.replaceAll(" ", "")), "").replaceAll("-", "")}${!title?.endsWith("Command") ? "Command" : ""}`
}

function _flowTitle(title) {
    var titleElements = title.replaceAll("flow:", "").split(" ").map(it => capitalizeFirstCharacter(it.replaceAll("-", ""))).join("")
    return `${slugify(capitalizeFirstCharacter(titleElements.replaceAll(" ", "")), "").replaceAll("-", "")}${!title?.endsWith("Flow") ? "Flow" : ""}`
}

function _sliceTitle(title) {
    return slugify(title.replaceAll(" ", "").replace("slice:", "")).replaceAll("-", "").toLowerCase()
}

function _sliceSpecificClassTitle(slice, suffix) {
    var titleElements = slice.split(" ").map(it => capitalizeFirstCharacter(_sliceTitle(it).replaceAll("-", ""))).join("")
    return `${capitalizeFirstCharacter(titleElements)}${suffix}`
}

function _processorTitle(title) {
    var titleElements = title.split(" ").map(it => capitalizeFirstCharacter(it.replaceAll("-", ""))).join("")
    return `${slugify(capitalizeFirstCharacter(titleElements), "").replaceAll("-", "")}Processor`
}

function _restResourceTitle(title) {
    var titleElements = title.split(" ").map(it => capitalizeFirstCharacter(it.replaceAll("-", ""))).join("")
    return `${slugify(capitalizeFirstCharacter(titleElements), "").replaceAll("-", "")}Resource`
}

function _readmodelTitle(title) {
    var titleElements = title.split(" ").map(it => capitalizeFirstCharacter(it.replaceAll("-", ""))).join("")
    return `${slugify(capitalizeFirstCharacter(titleElements.replaceAll(" ", "")), "").replaceAll("-", "")}ReadModel`
}

function _eventTitle(title) {
    var titleElements = title.split(" ").map(it => capitalizeFirstCharacter(it.replaceAll("-", ""))).join("")
    return `${slugify(capitalizeFirstCharacter(titleElements.replaceAll(" ", "")), "").replaceAll("-", "")}Event`
}

function _screenTitle(title) {
    var titleElements = title.split(" ").map(it => capitalizeFirstCharacter(it.replaceAll("-", ""))).join("")
    return `${slugify(capitalizeFirstCharacter(titleElements.replaceAll(" ", "").replaceAll("-", "")), "")}`
}

/**
 * @param basePackage
 * @param contextPackage context specific package for a bc within our system
 * @param infrastructure boolean flat - infrastructure or not - infrastructural packages only have the base package
 * @returns {string}
 * @private
 */
function _packageName(basePackage, contextPackage, infrastructure) {
    return infrastructure ? `${basePackage}` : contextPackage ? `${basePackage}.${contextPackage}` : basePackage
}

function _packageFolderName(basePackage, contextPackage, infrastructure) {
    return _packageName(basePackage, contextPackage, infrastructure).split(".").join("/")
}

module.exports = {
    _processorTitle,
    _restResourceTitle,
    _readmodelTitle,
    _eventTitle,
    _commandTitle,
    _aggregateTitle,
    _screenTitle,
    _sliceTitle,
    _sliceSpecificClassTitle,
    _packageName,
    _packageFolderName,
    _flowTitle
}
