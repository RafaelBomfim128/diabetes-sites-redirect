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

// Função para formatar o caminho curto
function formatPath(shortPath) {
    return shortPath
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
}

// Função para gerar o conteúdo do arquivo _redirects
function generateRedirects(links) {
    return links
        .map(([title, shortPath, fullUrl]) => `${formatPath(shortPath)}  ${fullUrl}  200`)
        .join('\n');
}

// Função para gerar HTML
function generateHtml(downloadLinks, tutorialLinks) {
    const generateSection = (title, links) => `
        <section>
            <h2>${title}</h2>
            <ul>
                ${links.map(([title, shortPath, fullUrl, newLink]) => `
                    <li>
                        <span>${title}</span>
                        <div class="button-container">  </div>
                        <button onclick="window.open('${fullUrl}', '_blank')">Acessar</button>
                        <button onclick="copyLink('${newLink}', this)">Copiar Link</button>
                    </li>
                `).join('')}
            </ul>
        </section>
    `;


    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Links do Diabetes</title>
    <link rel="icon" href="img/tecnologias-no-diabetes.jpeg" type="image/jpeg">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            margin: 0;
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
            list-style: none;
            padding: 0;
        }
        li {
            display: flex;
            flex-wrap: wrap; /* Permite que os itens quebrem a linha */
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 10px;
            transition: background-color 0.3s ease;
        }
        li span {
            flex-basis: 100%; /* Ocupa toda a largura disponível na tela pequena */
            margin-right: 0; /* Remove a margem direita */
            margin-bottom: 10px; /* Adiciona margem inferior para separar do botão */
         }

        .button-container {
            display: flex;
            justify-content: flex-end; /* Alinha os botões à direita */
            flex-basis: 100%; /* Garante que ocupe 100% da largura em telas pequenas */
            margin-top: 10px;
        }
        button {
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            background-color: #0078d7;
            color: white;
            cursor: pointer;
            font-weight: bold;
            margin-left: 10px; /* Adiciona espaço entre os botões */
            white-space: nowrap; /* Impede que o texto do botão quebre a linha */
        }
        button:hover {
            background-color: #0056b3;
        }
        footer {
            margin-top: auto;
            text-align: center;
            padding: 10px;
            font-size: smaller;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Links do Diabetes</h1>
        ${generateSection('Downloads', downloadLinks)}
        ${generateSection('Tutoriais', tutorialLinks)}
    </div>
    <footer>
        <p>Copyright © 2024 Equipe Milton Leão. Todos os direitos reservados.</p>
    </footer>
    <script>
        function copyLink(link, button) {
            navigator.clipboard.writeText(link)
                .then(() => {
                    button.style.backgroundColor = 'green';
                    button.textContent = 'Link copiado!';
                    setTimeout(() => {
                        button.style.backgroundColor = '';
                        button.textContent = 'Copiar Link';
                    }, 3000);
                })
                .catch(() => {
                    button.style.backgroundColor = 'red';
                    button.textContent = 'Erro!';
                    setTimeout(() => {
                        button.style.backgroundColor = '';
                        button.textContent = 'Copiar Link';
                    }, 3000);
                });
        }
    </script>
</body>
</html>
    `;
}

async function updateSheetLinks(sheets, sheetName, links) {
    const updatedLinks = links.map(([title, shortPath, fullUrl]) => {
        if (!title || !shortPath || !fullUrl) {
            return ['']; // Retorna vazio para linhas incompletas
        }
        const formattedPath = formatPath(shortPath);
        return [`https://diabetesdm1.netlify.app/${formattedPath}`]; // Adiciona o novo link
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!D2:D`, // Coluna D na respectiva aba
        valueInputOption: 'USER_ENTERED',  //USER_ENTERED para fórmulas e links
        requestBody: {
            values: updatedLinks,
        },
    });

    console.log(`Planilha ${sheetName} atualizada com os novos links na coluna D!`);
}


// Função principal
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

    // Atualizar a coluna "Novo link" (D) nas abas Downloads e Tutoriais
   await updateSheetLinks(sheets, 'Downloads', downloads);
   await updateSheetLinks(sheets, 'Tutoriais', tutorials);

    // Gerar _redirects
    const redirectsContent = `${generateRedirects(downloads)}\n${generateRedirects(tutorials)}`;
    fs.writeFileSync(redirectsFile, redirectsContent);
    console.log('_redirects gerado com sucesso!');


    // Gerar index.html (agora com os links atualizados)
    const htmlContent = generateHtml(downloadsWithNewLink, tutorialsWithNewLink);
    fs.writeFileSync(outputHtmlFile, htmlContent);
    console.log('index.html gerado com sucesso!');
}

// Execute o script
main().catch(console.error);