const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { google } = require('googleapis');
require('dotenv').config();

const domainSite = 'https://tecnologiasnodiabetes.com.br/';
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

const sheets = google.sheets({ version: 'v4', auth });

async function main() {
    const sheets = google.sheets({ version: 'v4', auth });

    const downloads = await readSheetData('Downloads!A:C');
    const tutorials = await readSheetData('Tutoriais!A:E');
    const faq = await readSheetData('FAQ!A:C');
    const notifications = await readSheetData('Avisos!A:D');

    const downloadsFormatted = formatLinksDownloads(downloads);
    const tutorialsFormatted = formatLinksTutorials(tutorials);
    const faqFormatted = formatFaqData(faq);
    const notificationsFormatted = formatNotificationsData(notifications);

    if (NODE_ENV !== 'read_only') {
        const updateSheetLinks = async (sheetName, column, links) => {
            const updatedLinks = links.map(([title, shortPath, fullUrl]) => {
                if (!title || !shortPath || !fullUrl) return [''];
                return [`${domainSite}${formatPath(shortPath)}`];
            });

            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!${column}3`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: updatedLinks },
            });

            console.log(`Planilha ${sheetName} atualizada com os novos links na coluna D!`);
        };

        //Atualização da coluna "Novo link" (D) nas abas Downloads e Tutoriais
        await updateSheetLinks('Downloads', 'D', downloads);
        await updateSheetLinks('Tutoriais', 'F', tutorials);
    }

    //_redirects
    const redirectsContent = `${generateRedirects(downloads)}\n${generateRedirects(tutorials)}`;
    fs.writeFileSync(redirectsFile, redirectsContent);
    console.log('_redirects gerado com sucesso!');

    registerPartials();

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

    const mostRecentNotificationId = notificationsFormatted[0].id

    generateHtml('template-index.html', 'index.html', {
        downloads: downloadsSection,
        tutoriais: tutorialsSection,
        faq: faqSection,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
        isFullPage: true
    });

    //Geração de páginas individuais
    generateHtml('template-downloads.html', 'downloads.html', {
        links: downloadsFormatted,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
        isFullPage: true
    });

    generateHtml('template-tutoriais.html', 'tutoriais.html', {
        links: tutorialsFormatted,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
        isFullPage: true
    });

    generateHtml('template-faq.html', 'faq.html', {
        questionAnswer: faqFormatted,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
        isFullPage: true
    });

    generateHtml('template-notificacoes.html', 'notificacoes.html', {
        notifications: notificationsFormatted,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
        isFullPage: true
    });

    notificationsFormatted.forEach((notification) => {
        generateHtml('template-notificacao-aberta.html', `detalhes-aviso-${formatPath(notification.id)}.html`, {
            notification: notification,
            apiBaseUrl,
            apiKey,
            mostRecentNotificationId,
            isFullPage: true
        });
    });
}

main().catch(error => {
    console.error("Erro durante a execução do script:", error);
    process.exit(1);
});

async function readSheetData(range) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return res.data.values ? res.data.values.slice(2) : [];
};

// Função para formatar o caminho curto
function formatPath(shortPath) {
    return shortPath
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
}

function generateRedirects(links) {
    return links
        .map(([title, shortPath, fullUrl]) => `${formatPath(shortPath)}  ${fullUrl}  200`)
        .join('\n');
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

function generateHtmlFromTemplate(templateFileName, data) {
    const templateFilePath = path.join(templatesDir, templateFileName);
    const templateContent = fs.readFileSync(templateFilePath, 'utf8');
    const template = handlebars.compile(templateContent);
    return template(data);
}

function groupLinksByCategory(links, order) {
    const grouped = links.reduce((accumulator, link) => {
      if (!accumulator[link.category]) {
        accumulator[link.category] = [];
      }
      accumulator[link.category].push(link);
      return accumulator;
    }, {});
  
    const orderedGrouped = {};
    order.forEach(category => {
      if (grouped[category]) {
        orderedGrouped[category] = grouped[category];
        delete grouped[category];
      }
    });
  
    return { ...orderedGrouped, ...grouped };
}

function formatLinksDownloads(arrItemsSheet) {
    const arrItemsSheetFormatted = arrItemsSheet.map(([title, shortPath, fullUrl, tag]) => {
        if (!title || !shortPath || !fullUrl) return [''];
        return { title, shortPath, fullUrl, newLink: `${domainSite}${formatPath(shortPath)}` };
    });
    return arrItemsSheetFormatted;
}

const orderTutorials = ['Ponto de partida', 'xDrip', 'Android APS', "Sensores", 'Nightscout', 'Relógios', 'Bombas', 'Outros'];
function formatLinksTutorials(arrItemsSheet) {
    const categoryIcons = {
        'Ponto de partida': './img/icons/icon-ponto-partida.png',
        'xDrip': './img/icons/icon-xdrip.png',
        'Android APS': './img/icons/icon-android-aps.png',
        'Sensores': './img/icons/icon-sensores.png',
        'Nightscout': './img/icons/icon-nightscout.png',
        'Relógios': './img/icons/icon-relogios.png',
        'Bombas': './img/icons/icon-bombas.png',
        'Outros': './img/icons/icon-tutorial-default.png',
    };

    const objItemsSheet = arrItemsSheet.map(([title, shortPath, fullUrl, category, tag]) => {
        if (!title || !shortPath || !fullUrl || !category || !tag) return [''];
        return { 
            title, 
            shortPath, 
            fullUrl, 
            category, 
            tag, 
            icon: categoryIcons[category] || './img/icons/icon-tutorial-default.png', // Define um ícone padrão se a categoria não tiver um específico
            newLink: `${domainSite}${formatPath(shortPath)}` 
        };
    });

    const groupedLinks = groupLinksByCategory(objItemsSheet, orderTutorials);
    return groupedLinks;
}

function formatFaqData(arrItemsSheet) {
    const arrItemsSheetFormatted = arrItemsSheet.map(([question, answer, id]) => {
        if (!question || !answer || !id) return [''];
        answer = answer.replace(/\n/g, '<br>');
        return { question, answer, id };
    });
    return arrItemsSheetFormatted;
}

function formatNotificationsData(arrItemsSheet) {
    arrItemsSheet = arrItemsSheet.reverse();
    const arrItemsSheetFormatted = arrItemsSheet.map(([title, content, date, id]) => {
        content = content.replace(/\n/g, '<br>');
        if (!title || !content || !date || !id) return [''];
        return { title, content, date, id };
    });
    return arrItemsSheetFormatted;
}