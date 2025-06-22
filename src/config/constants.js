const path = require('path')
require('dotenv').config();

const domainSite = 'https://tecnologiasnodiabetes.com.br/';
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const apiBaseUrl = process.env.API_BASE_URL;
const apiKey = process.env.API_KEY;
const NODE_ENV = process.env.NODE_ENV;

const paths = {
    templatesDir: path.join(__dirname, '../../src/templates'),
    partialsDir: path.join(__dirname, '../../src/templates/partials'),
    outputDir: path.join(__dirname, '../../public'),
    redirectsFile: path.join(__dirname, '../../public/_redirects')
};

module.exports = {
    domainSite,
    spreadsheetId,
    apiBaseUrl,
    apiKey,
    NODE_ENV,
    paths
};