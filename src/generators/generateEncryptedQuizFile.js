const fs = require('fs')
const path = require('path');
const formatQuizItems = require('../formatters/quizFormatter');
const { encryptData } = require('../utils/encryptData');

async function generateEncryptedQuizFile(arrItemsSheet) {
    const parsed = formatQuizItems(arrItemsSheet);
    const filepath = path.join(__dirname, '../..', 'public', 'encrypted-questions.json');
    const key = 'DCC52255D8D31EE38548E7F5B4BB4ABC';
    const encrypted = encryptData(parsed, key);
    saveEncryptedFile(filepath, encrypted);
}

function saveEncryptedFile(filepath, data) {
    fs.writeFileSync(filepath, JSON.stringify({ data }));
}

module.exports = generateEncryptedQuizFile;