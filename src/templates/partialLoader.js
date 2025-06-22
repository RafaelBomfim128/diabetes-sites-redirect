const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { paths } = require('../config/constants')

function registerPartials() {
    const partialFiles = fs.readdirSync(paths.partialsDir);
    partialFiles.forEach((file) => {
        const partialName = path.basename(file, '.html');
        const partialContent = fs.readFileSync(path.join(paths.partialsDir, file), 'utf8');
        handlebars.registerPartial(partialName, partialContent);
    });
}

module.exports = registerPartials;