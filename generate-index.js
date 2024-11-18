const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const redirectsFile = path.join(__dirname, '_redirects');
const outputHtmlFile = path.join(__dirname, 'index.html');

// Função para gerar HTML
function generateHtml(redirects) {
    const links = redirects.map(r => {
        const [path, url] = r.split(' ');
        return `        <li><a href="${path}" target="_blank">${path.replace('/', '')}</a></li>`;
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Links do Diabetes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        h1 {
            color: #0078d7;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            text-decoration: none;
            color: #0078d7;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>Links do Diabetes</h1>
    <p>Escolha um dos links abaixo para baixar ou acessar ferramentas úteis:</p>
    <ul>
${links.join('\n')}
    </ul>
</body>
</html>
    `;
}

// Ler o arquivo _redirects
fs.readFile(redirectsFile, 'utf-8', (err, data) => {
    if (err) {
        console.error('Erro ao ler o arquivo _redirects:', err);
        return;
    }

    const redirects = data.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
    const htmlContent = generateHtml(redirects);

    // Salvar o index.html
    fs.writeFile(outputHtmlFile, htmlContent, err => {
        if (err) {
            console.error('Erro ao salvar o arquivo index.html:', err);
        } else {
            console.log('index.html gerado com sucesso!');
        }
    });
});