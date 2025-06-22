const CryptoJS = require('crypto-js');

function encryptData(data, secretKey) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

function decryptData(data, secretKey) {
    const bytes = CryptoJS.AES.decrypt(data, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

module.exports = { encryptData, decryptData };