const fs = require('fs');
const path = require('path')
const { paths } = require('../config/constants')
const formatRedirects = require('../formatters/redirectsFormatter')

function saveRedirectsFile(content) {
    const redirectsPath = paths.redirectsFile;
    fs.writeFileSync(redirectsPath, content);
}

async function generateRedirects(downloads, tutorials) {
    const redirectsContent = [
        formatRedirects(downloads),
        formatRedirects(tutorials),
    ].join('\n');

    saveRedirectsFile(redirectsContent)
    console.log('_redirects gerado com sucesso!');
}

module.exports = generateRedirects