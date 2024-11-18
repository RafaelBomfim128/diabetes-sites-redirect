const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const redirectsFile = path.join(__dirname, '_redirects');
const outputHtmlFile = path.join(__dirname, 'index.html');

// Função para gerar HTML
function generateHtml(redirects) {
    const links = redirects.map(r => {
        const [path, url] = r.split(' ');
        const displayPath = path.replace('/', ''); // Nome amigável para exibição
        return `<li><a href="${path}" target="_blank">${displayPath}</a></li>`;
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
            min-height: 100vh; /* Garante que o rodapé fique no final */
        }
        .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            max-width: 800px;  /* Limita a largura máxima do conteúdo */
            width: 90%; /* Ocupa 90% da largura disponível, responsivo */
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
            margin: 15px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            transition: background-color 0.3s ease; /* Suaviza a transição de cor */
        }
        li:hover {
            background-color: #f9f9f9;
        }
        a {
            text-decoration: none;
            color: #0056b3; /* Cor do link mais escura */
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
        footer {
           margin-top: auto; /* Importante para o rodapé ficar no final */
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
    ${links.join('\n')}
        </ul>
    </div>

    <footer>
        <p>Exemplo de Rodapé</p>
    </footer>
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
