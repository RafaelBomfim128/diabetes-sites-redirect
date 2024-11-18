const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const redirectsFile = path.join(__dirname, '_redirects');
const outputHtmlFile = path.join(__dirname, 'index.html');

// Função para gerar HTML
function generateHtml(redirects) {
    const links = redirects.map(r => {
        const [path, url] = r.split(' ');
        const displayPath = path.replace('/', '');
        return `<li>
            <span>${displayPath}</span>
            <button onclick="window.open('${path}', '_blank')">Baixar</button>
            <button onclick="copyLink('${path}')">Copiar Link</button>
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
            margin-bottom: 10px; /* Adiciona espaço entre os itens da lista */
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
${links.join('\n')}
        </ul>
    </div>
    <footer>
        <p>Exemplo de Rodapé</p>
    </footer>

    <script>
        function copyLink(link) {
            navigator.clipboard.writeText(link)
                .then(() => {
                    alert("Link copiado para a área de transferência!");
                })
                .catch(err => {
                    console.error("Falha ao copiar o link: ", err);
                });
        }
    </script>
</body>
</html>`;
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