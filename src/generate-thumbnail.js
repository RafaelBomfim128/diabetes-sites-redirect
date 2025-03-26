const fs = require('fs');
const path = require('path');
const { pdfToPng } = require('pdf-to-png-converter');
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
        try {
            await pdfToPng(filePath, {
                disableFontFace: true, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
                useSystemFonts: true, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
                enableXfa: false, // Render Xfa forms if any. Default value is false.
                viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0 which means to display page on the existing canvas with 100% scale.
                outputFolder: thumbnailDir, // Folder to write output PNG files. If not specified, PNG output will be available only as a Buffer content, without saving to a file.
                outputFileMaskFunc: (pageNumber) => `${fileName}.png`, // Output filename mask function. Example: (pageNumber) => `page_${pageNumber}.png`
                pagesToProcess: [1], // Subset of pages to convert (first page = 1), other pages will be skipped if specified.
                strictPagesToProcess: true, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
                verbosityLevel: 0, // Verbosity level. ERRORS: 0, WARNINGS: 1, INFOS: 5. Default value is 0.
            });

            console.log(`Thumbnail gerado para o PDF: ${fileName}`);
            return outputThumbnail;
        } catch (err) {
            console.error(`Erro ao gerar thumbnail para o PDF ${fileName}:`, err);
            process.exit(1);
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
            process.exit(1);
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
        process.exit(1);
    }
}

module.exports = {
    generateAllThumbnails,
    generateThumbnail
};