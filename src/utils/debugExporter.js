const fs = require('fs')
const path = require('path')

function exportToTempFile(data, fileName) {
    const dirPath = path.join(__dirname, '../..', 'temp');

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(path.join(dirPath, fileName), JSON.stringify(data, null, 2));
}

module.exports = exportToTempFile