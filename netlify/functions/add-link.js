// functions/add-link.js

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    const { link, target } = body;

    // Caminho para o arquivo _redirects
    const redirectsFilePath = path.join(__dirname, '..', '_redirects');

    try {
      // Verifica se o arquivo _redirects existe
      if (!fs.existsSync(redirectsFilePath)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Arquivo _redirects não encontrado' }),
        };
      }

      // Adiciona o novo redirecionamento ao arquivo _redirects
      const newRedirect = `/${link} ${target} 200\n`;
      fs.appendFileSync(redirectsFilePath, newRedirect);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Link adicionado com sucesso' }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Erro ao adicionar o link', error }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Método HTTP não permitido' }),
  };
};
