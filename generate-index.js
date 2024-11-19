const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Caminhos dos arquivos
const redirectsFile = path.join(__dirname, '_redirects');
const outputHtmlFile = path.join(__dirname, 'index.html');

let environment = process.env.NODE_ENV

// Carregar as credenciais dependendo do ambiente
let credentials;
if (environment === 'production') {
    // Quando estiver no GitHub ou ambiente de produção, carrega as credenciais do ambiente
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));
} else {
    // Quando estiver localmente, carrega o arquivo JSON das credenciais
    credentials = require('./env/credentials.json');
}

// Configure a autenticação
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Obter o ID da planilha das variáveis de ambiente
let spreadsheetId
if (environment === 'production') {
    spreadsheetId = process.env.GOOGLE_SHEET_ID;
} else {
    spreadsheetId = fs.readFileSync('./env/sheet-id.txt', 'utf-8').trim();
}

if (!spreadsheetId) {
    throw new Error('O ID da planilha (GOOGLE_SHEET_ID) não foi definido nas variáveis de ambiente.');
}

// Intervalo de leitura e escrita
const readRange = 'Downloads!A:D'; // Inclui a coluna "Novo link"

// Função para formatar o caminho curto
function formatPath(shortPath) {
    return shortPath
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-') // Substituir espaços por traços
        .replace(/[^a-z0-9\-]/g, ''); // Remover caracteres inválidos
}

// Função para gerar o conteúdo do arquivo _redirects
function generateRedirects(links) {
    return links.map(([title, shortPath, fullUrl, newLink]) => {
        const formattedPath = formatPath(shortPath);
        return `/${formattedPath} ${fullUrl}`;
    }).join('\n');
}

// Função para gerar HTML
function generateHtml(links) {
    const linksWithNewLink = links.map(([title, shortPath, fullUrl]) => {
        const newLink = `https://diabetesdm1.netlify.app/${formatPath(shortPath)}`; // Gerar novo link
        return [title, shortPath, fullUrl, newLink]; // Adicionar newLink no array
    });

    const htmlLinks = linksWithNewLink.map(([title, shortPath, fullUrl, newLink]) => {
        return `<li>
            <span>${title}</span> <!-- Exibe o título (coluna A) -->
            <button onclick="window.open('${fullUrl}', '_blank')">Acessar</button>
            <button onclick="copyLink('${newLink}', this)">Copiar Link</button>
        </li>`;
    });

    return `<!DOCTYPE html>
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
        h1 {
            color: #0078d7;
            margin-bottom: 20px;
            text-align: center;
        }
        p {
            margin-bottom: 20px;
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
            transition: background-color 0.3s ease;
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
            margin-left: 5px;
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
        <p>Escolha um dos links abaixo para baixar ou acessar ferramentas úteis:</p>
        <ul>
${htmlLinks.join('\n')}
        </ul>
    </div>
    <footer>
        <p>Exemplo de Rodapé</p>
    </footer>
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
                    console.error("Falha ao copiar: ", err);
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

// Atualizar a coluna "Novo link" na planilha com verificação de valores ausentes
async function updateShortLinks(sheets, links) {
    const updatedLinks = links.map(([title, shortPath, fullUrl]) => {
        if (!title || !shortPath || !fullUrl) {
            // Retorna um valor vazio para linhas incompletas
            return [''];
        }
        const formattedPath = formatPath(shortPath);
        return [`https://diabetesdm1.netlify.app/${formattedPath}`];
    });

    // Atualizar a planilha apenas com os valores processados
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Página1!D2:D',
        valueInputOption: 'RAW',
        requestBody: {
            values: updatedLinks,
        },
    });

    console.log('Planilha atualizada! Linhas incompletas foram limpas.');
}

// Função principal
async function main() {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: readRange,
    });

    const rows = res.data.values;
    if (!rows || !rows.length) {
        console.error('Nenhum dado encontrado na planilha.');
        return;
    }

    // Remove o cabeçalho e processa as linhas restantes
    const links = rows.slice(1);

    // Filtrar apenas as linhas válidas
    const validLinks = [];
    const updatedLinks = links.map((row, index) => {
        const [title, shortPath, fullUrl, newLink] = row;

        // Checar se as colunas A, B e C estão preenchidas
        if (title && shortPath && fullUrl) {
            validLinks.push([title, shortPath, fullUrl]);
            return [`https://diabetesdm1.netlify.app/${formatPath(shortPath)}`]; // Gera o link
        } else {
            // Se faltar valor em A, B ou C, limpa o link na coluna D
            return [''];
        }
    });

    // Atualizar a coluna "Novo link" (D)
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Página1!D2:D',
        valueInputOption: 'RAW',
        requestBody: {
            values: updatedLinks,
        },
    });

    console.log('Planilha atualizada com os novos links na coluna D!');

    // Gerar arquivo _redirects
    const redirectsContent = generateRedirects(validLinks);
    fs.writeFileSync(redirectsFile, redirectsContent);
    console.log('_redirects gerado com sucesso!');

    // Gerar arquivo HTML
    const htmlContent = generateHtml(validLinks);
    fs.writeFileSync(outputHtmlFile, htmlContent);
    console.log('index.html gerado com sucesso!');
}

// Execute o script
main().catch(console.error);


// Execute o script
main().catch(console.error);
