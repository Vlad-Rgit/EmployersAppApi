const fs = require('fs');

module.exports = (dir, processFile) => {

    const files = fs.readdirSync(dir);

    files.forEach((filename) => {
        processFile(filename)
    })
}