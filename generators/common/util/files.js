const path = require("path");
const glob = require("glob");

function fileExistsByGlob(folder, pattern) {
    const fullPattern = path.join(folder, `*${pattern}*.sql`);
    const files = glob.sync(fullPattern);
    return files.length > 0;
}

module.exports = {fileExistsByGlob}
