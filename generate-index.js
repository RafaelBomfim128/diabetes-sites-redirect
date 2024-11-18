const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const redirectsFile = path.join(__dirname, '_redirects');
const outputHtmlFile = path.join(__dirname, 'index.html');

// Função para gerar HTML
function generateHtml(redirects) {
    const links = redirects.map(r => {
        const [path, url] = r.split(' ');
        return `
        <li>
            <a href="${url}" target="_blank">${path.replace('/', '')}</a>
        </li>`;
    });

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Links do Diabetes</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Arial', sans-serif;
            background-color: #e6f0ff;
            color: #333;
            padding: 0 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
        }
        h1 {
            color: #0066cc;
            font-size: 2.5rem;
            margin-bottom: 20px;
            text-align: center;
        }
        p {
            font-size: 1.1rem;
            color: #555;
            margin-bottom: 30px;
            text-align: center;
        }
        ul {
            list-style-type: none;
            width: 100%;
            max-width: 600px;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        li {
            width: 100%;
            margin: 10px 0;
            display: flex;
            justify-content: center;
        }
        a {
            font-size: 1.1rem;
            color: #0066cc;
            text-decoration: none;
            padding: 10px 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        a:hover {
            background-color: #007bff;
            color: #fff;
            box-shadow: 0 4px 10px rgba(0, 123, 255, 0.4);
        }
        @media (max-width: 600px) {
            h1 {
                font-size: 2rem;
            }
            p {
                font-size: 1rem;
            }
            a {
                font-size: 1rem;
                padding: 8px 15px;
            }
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
