const path = require("path");
const glob = require("glob");
const fs = require('fs');


function fileExistsByGlob(folder, pattern) {
    // Check if directory exists first
    const configPath = path.resolve(folder);

    if (!fs.existsSync(configPath)) {
        return false;
    }
    const fullPattern = path.join(folder, `${pattern}*`);

    const files = glob.sync(fullPattern);

    return files.length > 0;
}

module.exports = {fileExistsByGlob}
