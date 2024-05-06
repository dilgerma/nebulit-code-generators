
function findSlice(config, sliceName) {
    return config.slices.find((item) => item.title === sliceName)
}

function buildLink(boardId, itemId) {
    return `https://miro.com/app/board/${boardId}/?moveToWidget=${itemId}`
}
module.exports = {findSlice,buildLink}
