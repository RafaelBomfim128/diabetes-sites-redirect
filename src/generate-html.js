const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const CryptoJS = require('crypto-js');
const { google } = require('googleapis');
require('dotenv').config();
const labels = require('./labels.json');
const { generateAllThumbnails } = require('./generate-thumbnail');

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
    const tutorials = await readSheetData('Tutoriais!A:D');
    const faq = await readSheetData('FAQ!A:C');
    const notifications = await readSheetData('Avisos!A:D');
    const quiz = await readSheetData('Quiz!A:J');

    const downloadsFormatted = formatLinksDownloads(downloads);
    const tutorialsFormatted = formatLinksTutorials(tutorials);
    const faqFormatted = formatFaqData(faq);
    const notificationsFormatted = formatNotificationsData(notifications);
    formatQuizData(quiz);

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

            console.log(`Planilha ${sheetName} atualizada com os novos links na coluna ${column}!`);
        };

        //Atualização da coluna "Novo link" nas abas Downloads e Tutoriais
        await updateSheetLinks('Downloads', 'D', downloads);
        await updateSheetLinks('Tutoriais', 'E', tutorials);
    }

    //_redirects
    const redirectsContent = `${generateRedirects(downloads)}\n${generateRedirects(tutorials)}`;
    fs.writeFileSync(redirectsFile, redirectsContent);
    console.log('_redirects gerado com sucesso!');

    registerPartials();

    const mostRecentNotificationId = notificationsFormatted[0].id

    generateHtml('template-index.html', 'index.html', {
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    generateHtml('template-downloads.html', 'downloads.html', {
        links: downloadsFormatted,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    generateHtml('template-tutoriais.html', 'tutoriais.html', {
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId
    });
    
    generateHtml('template-tutoriais-sensores.html', 'tutoriais-sensores.html', {
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId
    });

    const tutorialsTotal = [];
    const addedShortPaths = new Set();
    for (let category in tutorialsFormatted) {
        tutorialsFormatted[category].forEach(tutorial => {
            if (!addedShortPaths.has(tutorial.shortPath)) {
                tutorialsTotal.push(tutorial);
                addedShortPaths.add(tutorial.shortPath);
            }
        });
    
        generateHtml('template-tutoriais-item.html', `item-tutorial-${formatPath(category)}.html`, {
            links: tutorialsFormatted[category],
            title: category,
            desc: labels.tutorials.find(item => item.category === category)?.description || '',
            image: labels.tutorials.find(item => item.category === category)?.image || '',
            apiBaseUrl,
            apiKey,
            mostRecentNotificationId,
        });
    }

    generateHtml('template-tutoriais-item.html', 'item-tutorial-total.html', {
        links: tutorialsTotal,
        title: 'Todos os tutoriais',
        desc: 'Todos os tutoriais disponíveis em uma única página.',
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    generateHtml('template-tutoriais-item.html', `item-tutorial-libre.html`, {
        links: tutorialsFormatted['Libre'],
        title: 'Freestyle Libre 1 e 2',
        desc: labels.tutorials.find(item => item.category === 'Libre').description,
        image: labels.tutorials.find(item => item.category === 'Libre').image,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    generateHtml('template-tutoriais-item.html', `item-tutorial-aidex.html`, {
        links: tutorialsFormatted['AiDEX'],
        title: 'AiDEX',
        desc: labels.tutorials.find(item => item.category === 'AiDEX').description,
        image: labels.tutorials.find(item => item.category === 'AiDEX').image,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    generateHtml('template-tutoriais-item.html', `item-tutorial-sibionics.html`, {
        links: tutorialsFormatted['Sibionics'],
        title: 'Sibionics',
        desc: labels.tutorials.find(item => item.category === 'Sibionics').description,
        image: labels.tutorials.find(item => item.category === 'Sibionics').image,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    generateHtml('template-faq.html', 'faq.html', {
        questionAnswer: faqFormatted,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    generateHtml('template-notificacoes.html', 'notificacoes.html', {
        notifications: notificationsFormatted,
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    notificationsFormatted.forEach((notification) => {
        generateHtml('template-notificacao-aberta.html', `detalhes-aviso-${formatPath(notification.id)}.html`, {
            notification: notification,
            apiBaseUrl,
            apiKey,
            mostRecentNotificationId,
        });
    });

    generateHtml('template-quiz.html', 'quiz.html', {
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
    });

    const pdfDataToHtml = await generateAllThumbnails();

    const pdfCategoriesPages = [];
    const allPdfs = [];
    for (let category in pdfDataToHtml) {
        pdfCategoriesPages.push({
            title: labels.usefulContents.find(item => item.category === category).category,
            icon: labels.usefulContents.find(item => item.category === category).image,
            desc: labels.usefulContents.find(item => item.category === category).description,
            url: `${formatPath(category)}.html`
        })
        allPdfs.push(...pdfDataToHtml[category]);

        generateHtml('template-conteudos-uteis.html', `${formatPath(category)}.html`, {
            apiBaseUrl,
            apiKey,
            mostRecentNotificationId,
            pdfs: pdfDataToHtml[category],
            title: labels.usefulContents.find(item => item.category === category).category,
            description: labels.usefulContents.find(item => item.category === category).description
        });
    }

    generateHtml('template-conteudos-uteis.html', 'conteudos-uteis-total.html', {
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
        pdfs: allPdfs,
        title: 'Todos os conteúdos úteis',
        description: 'Todos os conteúdos úteis disponíveis em uma única página'
    });

    pdfCategoriesPages.push({
        title: labels.usefulContents.find(item => item.category === 'Ver tudo').category,
        icon: undefined,
        desc: labels.usefulContents.find(item => item.category === 'Ver tudo').description,
        url: 'conteudos-uteis-total.html'
    })

    generateHtml('template-conteudos-uteis-categorias.html', 'conteudos-uteis-categorias.html', {
        apiBaseUrl,
        apiKey,
        mostRecentNotificationId,
        categories: pdfCategoriesPages
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
        .normalize('NFD') // Normaliza a string
        .replace(/[\u0300-\u036f]/g, '') // Remove os diacríticos (acentos)
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

function formatLinksDownloads(arrItemsSheet) {
    const arrItemsSheetFormatted = arrItemsSheet.map(([title, shortPath, fullUrl, tag]) => {
        if (!title || !shortPath || !fullUrl) return [''];
        return { title, shortPath, fullUrl, newLink: `${domainSite}${formatPath(shortPath)}` };
    });
    return arrItemsSheetFormatted;
}

function formatLinksTutorials(arrItemsSheet) {
    const formattedObj = {};

    arrItemsSheet.forEach(([title, shortPath, fullUrl, categories]) => {
        if (!title || !shortPath || !fullUrl || !categories) return;

        // Dividindo a string de categorias em um array
        const categoryList = categories.split(',').map(cat => cat.trim());

        categoryList.forEach(category => {
            if (!formattedObj[category]) {
                formattedObj[category] = [];
            }

            formattedObj[category].push({
                title,
                shortPath,
                fullUrl,
                category,
                newLink: `${domainSite}${formatPath(shortPath)}`
            });
        });
    });

    return formattedObj;
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

function formatQuizData(arrItemsSheet) {
    const arrItemsSheetFormatted = arrItemsSheet.map(([question, alternativeA, alternativeB, alternativeC, alternativeD, alternativeCorrect, explanation, difficulty, category, id]) => {
        if (!question || !alternativeCorrect || !explanation || !id) return null;

        const alternativesObj = {
            A: alternativeA,
            B: alternativeB,
            C: alternativeC,
            D: alternativeD
        };

        const corrects = alternativeCorrect.replace(/ e /g, ',')
            .split(/[ ,]+/)
            .map(word => word.trim().toUpperCase())
            .filter(word => word !== '');

        const filteredAlternatives = Object.entries(alternativesObj)
            .filter(([key, value]) => value != null && value.trim() !== '')
            .map(([key, value]) => ({ key, value, isCorrect: corrects.includes(key) }));

        if (filteredAlternatives.length < 2) return null;

        return {
            question,
            alternatives: filteredAlternatives,
            explanation,
            corrects,
            difficulty,
            category,
            id
        }

    }).filter(item => item !== null);

    //Dado não confidencial
    const key = 'DCC52255D8D31EE38548E7F5B4BB4ABC';

    const encryptedQuestions = encryptData(arrItemsSheetFormatted, key);

    fs.writeFileSync(path.join(__dirname, '..', 'public', 'encrypted-questions.json'), JSON.stringify({ data: encryptedQuestions }));
    console.log('As questões foram criptografadas e salvas.');
}

function encryptData(data, secretKey) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

function exportToFile(data, fileName) {
    const dirPath = path.join(__dirname, '..', 'temp');

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(path.join(dirPath, fileName), JSON.stringify(data, null, 2));
}