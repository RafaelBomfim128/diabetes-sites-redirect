const fs = require('fs');
const path = require('path');
const pdfPoppler = require('pdf-poppler');
const sharp = require('sharp'); // Biblioteca para manipulação de imagens

const pdfDir = path.join(__dirname, '../public/pdfs');
const thumbnailDir = path.join(__dirname, '../public/img/thumbnails/Geradas dinamicamente');

if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir, { recursive: true });
}

async function generateThumbnail(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath).toLowerCase();
    const outputThumbnail = path.join(thumbnailDir, `${fileName}.png`);

    // Verifica se a thumbnail já existe
    if (fs.existsSync(outputThumbnail)) {
        return outputThumbnail; // Não gera novamente
    }

    if (ext === '.pdf') {
        // Geração de thumbnail para PDF
        const opts = {
            format: 'png',
            out_dir: thumbnailDir,
            out_prefix: fileName,
            page: 1
        };

        try {
            await pdfPoppler.convert(filePath, opts);

            // Verificar e renomear qualquer arquivo gerado com "-1", "-01", "-001", etc.
            const generatedFiles = fs.readdirSync(thumbnailDir).filter(file =>
                file.startsWith(fileName) && (file.endsWith('-1.png') || file.endsWith('-01.png') || file.endsWith('-001.png') || file.endsWith('-0001.png'))
            );

            if (generatedFiles.length > 0) {
                const tempThumbnail = path.join(thumbnailDir, generatedFiles[0]);
                fs.renameSync(tempThumbnail, outputThumbnail); // Renomeia para remover sufixos como "-1"
                console.log(`Thumbnail gerado para o PDF: ${fileName}`);
                return outputThumbnail;
            } else {
                console.error(`Nenhuma thumbnail encontrada para o PDF: ${fileName}`);
                return null;
            }
        } catch (err) {
            console.error(`Erro ao gerar thumbnail para o PDF ${fileName}:`, err);
            return null;
        }
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        // Geração de thumbnail para imagens (PNG, JPG, JPEG)
        try {
            await sharp(filePath)
                .resize({ width: 300, height: 300, fit: 'cover' }) // Redimensiona para o tamanho do thumbnail
                .toFile(outputThumbnail);

            console.log(`Thumbnail gerado para a imagem: ${fileName}`);
            return outputThumbnail;
        } catch (err) {
            console.error(`Erro ao gerar thumbnail para a imagem ${fileName}:`, err);
            return null;
        }
    } else {
        console.log(`Tipo de arquivo não suportado: ${filePath}`);
        return null;
    }
}

function getAllFiles(dir) {
    let allFiles = [];

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            allFiles = allFiles.concat(getAllFiles(fullPath));
        } else {
            allFiles.push(fullPath);
        }
    }

    return allFiles;
}

async function generateAllThumbnails() {
    try {
        const allFiles = getAllFiles(pdfDir);
        const supportedFiles = allFiles.filter(file =>
            ['.pdf', '.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase())
        );

        const categorizedData = {};

        for (const file of supportedFiles) {
            const thumbnailPath = await generateThumbnail(file);

            if (thumbnailPath) {
                const relativePath = path.relative(pdfDir, file);
                const category = path.dirname(relativePath).replace(/\\/g, '/');

                if (!categorizedData[category]) {
                    categorizedData[category] = [];
                }

                categorizedData[category].push({
                    title: path.basename(file),
                    url: `./pdfs/${relativePath.replace(/\\/g, '/')}`,
                    thumbnail: `./img/thumbnails/Geradas dinamicamente/${path.basename(thumbnailPath)}`
                });
            }
        }

        console.log('Todas as thumbnails foram geradas!');
        return categorizedData; // Retorna os dados categorizados
    } catch (err) {
        console.error('Erro ao processar os arquivos:', err);
        return {};
    }
}

module.exports = {
    generateAllThumbnails,
    generateThumbnail
};
