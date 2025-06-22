const { google } = require('googleapis');

const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

module.exports = sheets;