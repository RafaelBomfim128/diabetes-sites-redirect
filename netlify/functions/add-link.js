const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { path: redirectPath, url } = JSON.parse(event.body);

  if (!redirectPath || !url) {
    return { statusCode: 400, body: 'Path and URL are required' };
  }

  const redirectsFilePath = path.resolve(process.cwd(), '_redirects');

  try {
    // Atualiza o arquivo _redirects
    fs.appendFileSync(redirectsFilePath, `${redirectPath} ${url}\n`);
    return { statusCode: 200, body: 'Link adicionado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar _redirects:', error);
    return { statusCode: 500, body: 'Erro ao adicionar link.' };
  }
};
