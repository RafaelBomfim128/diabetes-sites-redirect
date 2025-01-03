const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { google } = require('googleapis');
require('dotenv').config();

const domainSite = 'https://diabetesdm1.netlify.app/';
const redirectsFile = path.join(__dirname, '..', 'public', '_redirects');
const outputDir = path.join(__dirname, '..', 'public');
const templatesDir = path.join(__dirname, 'templates');
const partialsDir = path.join(templatesDir, 'partials');

const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const apiBaseUrl = process.env.API_BASE_URL
const apiKey = process.env.API_KEY
const NODE_ENV = process.env.NODE_ENV

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Função para formatar o caminho curto
function formatPath(shortPath) {
    return shortPath
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
}

function registerPartials() {
    const partialFiles = fs.readdirSync(partialsDir);
    partialFiles.forEach((file) => {
        const partialName = path.basename(file, '.html'); // Exemplo: 'footer.html' -> 'footer'
        const partialContent = fs.readFileSync(path.join(partialsDir, file), 'utf8');
        handlebars.registerPartial(partialName, partialContent);
    });
}

function generateHtml(templateFileName, outputFileName, data) {
    const templateFilePath = path.join(templatesDir, templateFileName);
    const templateContent = fs.readFileSync(templateFilePath, 'utf8');
    const template = handlebars.compile(templateContent);

    const htmlContent = template(data);
    const outputFilePath = path.join(outputDir, outputFileName);
    fs.writeFileSync(outputFilePath, htmlContent);

    console.log(`${outputFileName} gerado com sucesso!`);
}

function generateRedirects(links) {
    return links
        .map(([title, shortPath, fullUrl]) => `${formatPath(shortPath)}  ${fullUrl}  200`)
        .join('\n');
}

async function main() {
    const sheets = google.sheets({ version: 'v4', auth });

    const readSheetData = async (range) => {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        return res.data.values ? res.data.values.slice(2) : [];
    };

    const downloads = await readSheetData('Downloads!A:C');
    const tutorials = await readSheetData('Tutoriais!A:C');
    const faq = await readSheetData('FAQ!A:B');

    const formatLinksData = (arrItemsSheet) => {
        const arrItemsSheetFormatted = arrItemsSheet.map(([title, shortPath, fullUrl]) => {
            if (!title || !shortPath || !fullUrl) return [''];
            return { title, shortPath, fullUrl, newLink: `${domainSite}${formatPath(shortPath)}` };
        });
        return arrItemsSheetFormatted;
    };

    const formatFaqData = (arrItemsSheet) => {
        const arrItemsSheetFormatted = arrItemsSheet.map(([question, answer]) => {
            if (!question || !answer) return [''];
            return { question, answer };
        });
        return arrItemsSheetFormatted;
    };

    const downloadsFormatted = formatLinksData(downloads);
    const tutorialsFormatted = formatLinksData(tutorials);
    const faqFormatted = formatFaqData(faq);

    if (NODE_ENV !== 'read_only') {
        const updateSheetLinks = async (sheetName, links) => {
            const updatedLinks = links.map(([title, shortPath, fullUrl]) => {
                if (!title || !shortPath || !fullUrl) return [''];
                return [`${domainSite}${formatPath(shortPath)}`];
            });

            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!D2:D`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: updatedLinks },
            });

            console.log(`Planilha ${sheetName} atualizada com os novos links na coluna D!`);
        };

        //Atualização da coluna "Novo link" (D) nas abas Downloads e Tutoriais
        await updateSheetLinks('Downloads', downloads);
        await updateSheetLinks('Tutoriais', tutorials);
    }

    //_redirects
    const redirectsContent = `${generateRedirects(downloads)}\n${generateRedirects(tutorials)}`;
    fs.writeFileSync(redirectsFile, redirectsContent);
    console.log('_redirects gerado com sucesso!');

    registerPartials();

    function generateHtmlFromTemplate(templateFileName, data) {
        const templateFilePath = path.join(templatesDir, templateFileName);
        const templateContent = fs.readFileSync(templateFilePath, 'utf8');
        const template = handlebars.compile(templateContent);
        return template(data);
    }

    //Geração de seções para o index.html
    const downloadsSection = generateHtmlFromTemplate('template-downloads.html', {
        links: downloadsFormatted,
        isFullPage: false
    });

    const tutorialsSection = generateHtmlFromTemplate('template-tutoriais.html', {
        links: tutorialsFormatted,
        isFullPage: false
    });

    const faqSection = generateHtmlFromTemplate('template-faq.html', {
        questionAnswer: faqFormatted,
        isFullPage: false
    });

    generateHtml('template-index.html', 'index.html', {
        downloads: downloadsSection,
        tutoriais: tutorialsSection,
        faq: faqSection,
        apiBaseUrl,
        apiKey,
        isFullPage: true
    });

    //Geração de páginas individuais
    generateHtml('template-downloads.html', 'downloads.html', {
        links: downloadsFormatted,
        apiBaseUrl,
        apiKey,
        isFullPage: true
    });

    generateHtml('template-tutoriais.html', 'tutoriais.html', {
        links: tutorialsFormatted,
        apiBaseUrl,
        apiKey,
        isFullPage: true
    });

    generateHtml('template-faq.html', 'faq.html', {
        questionAnswer: faqFormatted,
        apiBaseUrl,
        apiKey,
        isFullPage: true
    });
}

main().catch(error => {
    console.error("Erro durante a execução do script:", error);
    process.exit(1);
});
