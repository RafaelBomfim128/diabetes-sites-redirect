const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Caminhos dos arquivos
const redirectsFile = path.join(__dirname, '_redirects');
const outputHtmlFile = path.join(__dirname, 'index.html');

let environment = process.env.NODE_ENV;

// Carregar as credenciais dependendo do ambiente
let credentials;
if (environment === 'production') {
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));
} else {
    credentials = require('./env/credentials.json');
}

// Configure a autenticação
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Obter o ID da planilha
let spreadsheetId;
if (environment === 'production') {
    spreadsheetId = process.env.GOOGLE_SHEET_ID;
} else {
    spreadsheetId = fs.readFileSync('./env/sheet-id.txt', 'utf-8').trim();
}

if (!spreadsheetId) {
    throw new Error('O ID da planilha (GOOGLE_SHEET_ID) não foi definido nas variáveis de ambiente.');
}

// Função para formatar o caminho curto
function formatPath(shortPath) {
    return shortPath
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
}

// Função para gerar HTML de uma seção
function generateSectionHtml(title, links) {
    const linksWithNewLink = links.map(([title, shortPath, fullUrl]) => {
        const newLink = `https://diabetesdm1.netlify.app/${formatPath(shortPath)}`;
        return [title, shortPath, fullUrl, newLink];
    });

    const htmlLinks = linksWithNewLink.map(([title, shortPath, fullUrl, newLink]) => {
        return `<li>
            <span>${title}</span>
            <button onclick="window.open('${fullUrl}', '_blank')">Acessar</button>
            <button onclick="copyLink('${newLink}', this)">Copiar Link</button>
        </li>`;
    });

    return `
        <section>
            <h2>${title}</h2>
            <ul>
                ${htmlLinks.join('\n')}
            </ul>
        </section>
    `;
}

// Função para gerar HTML completo
function generateHtml(downloadLinks, tutorialLinks) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Links do Diabetes</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; color: #333; }
        .container { background-color: #fff; padding: 30px; border-radius: 8px; max-width: 800px; margin: auto; }
        h1, h2 { text-align: center; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; display: flex; justify-content: space-between; }
        button { padding: 8px 12px; background-color: #0078d7; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background-color: #0056b3; }
        footer { text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Links do Diabetes</h1>
        ${generateSectionHtml('Downloads', downloadLinks)}
        ${generateSectionHtml('Tutoriais', tutorialLinks)}
    </div>
    <footer>Exemplo de Rodapé</footer>
    <script>
        function copyLink(link, button) {
            navigator.clipboard.writeText(link)
                .then(() => {
                    button.style.backgroundColor = "green";
                    button.textContent = "Link copiado!";
                    setTimeout(() => { button.style.backgroundColor = ""; button.textContent = "Copiar Link"; }, 3000);
                })
                .catch(() => { button.style.backgroundColor = "red"; button.textContent = "Erro!"; });
        }
    </script>
</body>
</html>`;
}

// Função principal
async function main() {
    const sheets = google.sheets({ version: 'v4', auth });

    // Obter dados das abas "Downloads" e "Tutoriais"
    const [downloadsRes, tutorialsRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId, range: 'Downloads!A:D' }),
        sheets.spreadsheets.values.get({ spreadsheetId, range: 'Tutoriais!A:D' }),
    ]);

    const downloads = downloadsRes.data.values || [];
    const tutorials = tutorialsRes.data.values || [];

    // Remover cabeçalhos
    const downloadLinks = downloads.slice(1).filter(row => row[0] && row[1] && row[2]);
    const tutorialLinks = tutorials.slice(1).filter(row => row[0] && row[1] && row[2]);

    // Atualizar as colunas "Novo link"
    const updateLinks = async (range, links) => {
        const newLinks = links.map(([_, shortPath]) => [`https://diabetesdm1.netlify.app/${formatPath(shortPath)}`]);
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: { values: newLinks },
        });
    };

    await Promise.all([
        updateLinks('Downloads!D2:D', downloadLinks),
        updateLinks('Tutoriais!D2:D', tutorialLinks),
    ]);

    console.log('Planilhas atualizadas!');

    // Gerar arquivos
    const htmlContent = generateHtml(downloadLinks, tutorialLinks);
    fs.writeFileSync(outputHtmlFile, htmlContent);
    console.log('index.html gerado com sucesso!');
}

main().catch(console.error);
