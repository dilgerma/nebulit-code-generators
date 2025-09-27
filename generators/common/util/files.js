const path = require("path");
const glob = require("glob");
const fs = require('fs');

function fileExistsByGlob(folder, pattern, allPattern = true) {
    // Resolve folder to an absolute path (relative to process.cwd())
    const folderPath = path.resolve(folder);

    // Quick fail if folder doesn't exist
    if (!fs.existsSync(folderPath)) {
        return false;
    }

    if (!allPattern) {
        // exact filename check — do NOT use glob for this
        const filePath = path.join(folderPath, pattern);
        return fs.existsSync(filePath);
    }

    // allPattern => treat `pattern` as prefix and match anything after it
    const searchPattern = path.join(folderPath, `${pattern}*`);
    const files = glob.sync(searchPattern, { nodir: true });
    return files.length > 0;
}



module.exports = {fileExistsByGlob}
