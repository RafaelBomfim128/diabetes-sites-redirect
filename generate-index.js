const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { google } = require('googleapis');
require('dotenv').config();

const redirectsFile = path.join(__dirname, '_redirects');
const outputHtmlFile = path.join(__dirname, 'index.html');
const templateFile = path.join(__dirname, 'template.html');

const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const apiBaseUrl = process.env.API_BASE_URL
const apiKey = process.env.API_KEY

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

function generateRedirects(links) {
    return links
        .map(([title, shortPath, fullUrl]) => `${formatPath(shortPath)}  ${fullUrl}  200`)
        .join('\n');
}

function generateSection(title, links) {
    return`
        <section>
            <h2>${title}</h2>
            <ul>
                ${links.map(([title, shortPath, fullUrl, newLink]) => `
                    <li>
                        <span>${title}</span>
                        <button onclick="window.open('${fullUrl}', '_blank')">Acessar</button>
                        <button onclick="copyLink('${newLink}', this)">Copiar Link</button>
                    </li>`)
                .join('')}
            </ul>
        </section>`;
}

async function updateSheetLinks(sheets, sheetName, links) {
    const updatedLinks = links.map(([title, shortPath, fullUrl]) => {
        if (!title || !shortPath || !fullUrl) {
            return ['']; //Retorna vazio para linhas incompletas
        }
        const formattedPath = formatPath(shortPath);
        return [`https://diabetesdm1.netlify.app/${formattedPath}`]; //Adiciona o novo link
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!D2:D`, // Coluna D 
        valueInputOption: 'USER_ENTERED',  //USER_ENTERED para fórmulas e links
        requestBody: {
            values: updatedLinks,
        },
    });

    console.log(`Planilha ${sheetName} atualizada com os novos links na coluna D!`);
}

async function main() {
    const sheets = google.sheets({ version: 'v4', auth });

    const readSheetData = async (range) => {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        return res.data.values ? res.data.values.slice(1) : [];
    };

    const downloads = await readSheetData('Downloads!A:C');
    const tutorials = await readSheetData('Tutoriais!A:C');

    // Adicionando o newLink nos arrays downloads e tutorials
    const downloadsWithNewLink = downloads.map(([title, shortPath, fullUrl]) => {
        const newLink = `https://diabetesdm1.netlify.app/${formatPath(shortPath)}`;
        return [title, shortPath, fullUrl, newLink];
    });

    const tutorialsWithNewLink = tutorials.map(([title, shortPath, fullUrl]) => {
        const newLink = `https://diabetesdm1.netlify.app/${formatPath(shortPath)}`;
        return [title, shortPath, fullUrl, newLink];
    });

    //Atualização da coluna "Novo link" (D) nas abas Downloads e Tutoriais
    await updateSheetLinks(sheets, 'Downloads', downloads);
    await updateSheetLinks(sheets, 'Tutoriais', tutorials);

    //_redirects
    const redirectsContent = `${generateRedirects(downloads)}\n${generateRedirects(tutorials)}`;
    fs.writeFileSync(redirectsFile, redirectsContent);
    console.log('_redirects gerado com sucesso!');

    const templateContent = fs.readFileSync(templateFile, 'utf8');
    const template = handlebars.compile(templateContent);

    const htmlContent = template({
        downloads: generateSection('Downloads', downloadsWithNewLink),
        tutoriais: generateSection('Tutoriais', tutorialsWithNewLink),
        apiBaseUrl,
        apiKey,
    });

    fs.writeFileSync(outputHtmlFile, htmlContent);
    console.log('index.html gerado com sucesso!');
}

main().catch(error => {
    console.error("Erro durante a execução do script:", error);
    process.exit(1);
});