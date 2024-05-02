
function findSlice(config, sliceName) {
    return config.slices.find((item) => item.title === sliceName)
}
module.exports = {findSlice}
