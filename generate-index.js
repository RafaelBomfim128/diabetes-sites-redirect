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

let spreadsheetId;
if (environment === 'production') {
    spreadsheetId = process.env.GOOGLE_SHEET_ID;
} else {
    spreadsheetId = fs.readFileSync('./env/sheet-id.txt', 'utf-8').trim();
}

if (!spreadsheetId) {
    throw new Error('O ID da planilha (GOOGLE_SHEET_ID) não foi definido nas variáveis de ambiente.');
}

// Intervalos de leitura
const ranges = {
    downloads: 'Downloads!A:D',
    tutoriais: 'Tutoriais!A:D',
};

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
    const htmlLinks = links.map(([title, shortPath, fullUrl, newLink]) => {
        return `
        <li>
            <span>${title}</span>
            <button onclick="window.open('${fullUrl}', '_blank')">Acessar</button>
            <button onclick="copyLink('${newLink}', this)">Copiar Link</button>
        </li>`;
    });

    return `
    <section>
        <h2>${title}</h2>
        <ul>${htmlLinks.join('\n')}</ul>
    </section>`;
}

// Função para gerar HTML completo
function generateHtml(data) {
    const sectionsHtml = Object.entries(data).map(([sectionTitle, links]) => 
        generateSectionHtml(sectionTitle, links)
    );

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Links do Diabetes</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
                color: #333;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                background-color: #fff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                max-width: 800px;
                width: 90%;
            }
            h1, h2 {
                color: #0078d7;
                text-align: center;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 10px;
            }
            li span {
                flex-grow: 1;
                margin-right: 10px;
            }
            button {
                padding: 8px 12px;
                border: none;
                border-radius: 5px;
                background-color: #0078d7;
                color: white;
                cursor: pointer;
                font-weight: bold;
            }
            button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Links do Diabetes</h1>
            ${sectionsHtml.join('\n')}
        </div>
        <script>
            function copyLink(link, button) {
                navigator.clipboard.writeText(link)
                    .then(() => {
                        button.style.backgroundColor = "green";
                        button.textContent = "Link copiado!";
                        setTimeout(() => {
                            button.style.backgroundColor = "";
                            button.textContent = "Copiar Link";
                        }, 3000);
                    })
                    .catch(err => {
                        console.error("Erro ao copiar: ", err);
                        button.style.backgroundColor = "red";
                        button.textContent = "Erro!";
                        setTimeout(() => {
                            button.style.backgroundColor = "";
                            button.textContent = "Copiar Link";
                        }, 3000);
                    });
            }
        </script>
    </body>
    </html>`;
}

// Função principal
async function main() {
    const sheets = google.sheets({ version: 'v4', auth });
    const data = {};

    for (const [section, range] of Object.entries(ranges)) {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = res.data.values;
        if (!rows || !rows.length) {
            console.error(`Nenhum dado encontrado para ${section}.`);
            data[section] = [];
            continue;
        }

        const links = rows.slice(1).map(([title, shortPath, fullUrl]) => {
            const newLink = `https://diabetesdm1.netlify.app/${formatPath(shortPath)}`;
            return [title, shortPath, fullUrl, newLink];
        });

        data[section] = links;
    }

    const htmlContent = generateHtml({
        Downloads: data.downloads,
        Tutoriais: data.tutoriais,
    });

    fs.writeFileSync(outputHtmlFile, htmlContent);
    console.log('index.html gerado com sucesso!');
}

// Execute o script
main().catch(console.error);
