/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

function findSlice(config, sliceName) {
    return config.slices.find((item) => item.title === sliceName)
}

function findSliceByCommandId(config, id) {
    return config.slices.filter(it => it.commands.some(item => item.id === id))[0]
}

function findSliceByReadModelId(config, id) {
    return config.slices.filter(it => it.readmodels.some(item => item.id === id))[0]
}


function buildLink(boardId, itemId) {
    return `https://miro.com/app/board/${boardId}/${itemId ? `?moveToWidget=${itemId}` : "s"}`
}

module.exports = {findSlice, buildLink, findSliceByCommandId, findSliceByReadModelId}
