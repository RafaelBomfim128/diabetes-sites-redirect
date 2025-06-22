jest.mock('fs');
jest.mock('handlebars');
jest.mock('../../src/templates/partialLoader');

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { compile, render, renderToFile } = require('../../src/templates/htmlCompiler');
const registerPartials = require('../../src/templates/partialLoader');
const { paths } = require('../../src/config/constants');

describe('htmlCompiler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { }); //Disabling console.log
    });

    afterAll(() => {
        console.log.mockRestore(); //Enabling after tests
    });

    describe('compile()', () => {
        it('compile the template content correctly', () => {
            const fakeTemplate = '<h1>{{title}}</h1>';
            const compiledFn = jest.fn();

            fs.readFileSync.mockReturnValue(fakeTemplate);
            handlebars.compile.mockReturnValue(compiledFn);

            const result = compile('template.html');

            expect(fs.readFileSync).toHaveBeenCalledWith(path.join(paths.templatesDir, 'template.html'), 'utf8');
            expect(handlebars.compile).toHaveBeenCalledWith(fakeTemplate);
            expect(result).toBe(compiledFn);
        });
    });

    describe('render()', () => {
        it('render HTML with the given data', () => {
            const fakeTemplateContent = '<h1>{{title}}</h1>';
            const compiledFn = jest.fn().mockReturnValue('<h1>Hello</h1>');

            fs.readFileSync.mockReturnValue(fakeTemplateContent);
            handlebars.compile.mockReturnValue(compiledFn);

            const html = render('template.html', { title: 'Hello' });

            expect(fs.readFileSync).toHaveBeenCalledWith(path.join(paths.templatesDir, 'template.html'), 'utf8');
            expect(handlebars.compile).toHaveBeenCalledWith(fakeTemplateContent);
            expect(compiledFn).toHaveBeenCalledWith({ title: 'Hello' });
            expect(html).toBe('<h1>Hello</h1>');
        });
    });

    describe('renderToFile()', () => {
        it('render the template and write to the output file', () => {
            const fakeTemplateContent = '<h1>{{title}}</h1>';
            const renderedHtml = '<h1>Example</h1>';
            const compiledFn = jest.fn().mockReturnValue(renderedHtml);

            fs.readFileSync.mockReturnValue(fakeTemplateContent);
            handlebars.compile.mockReturnValue(compiledFn);

            renderToFile('template.html', 'output.html', { title: 'Example' });

            expect(registerPartials).toHaveBeenCalled();
            expect(fs.readFileSync).toHaveBeenCalledWith(path.join(paths.templatesDir, 'template.html'), 'utf8');
            expect(handlebars.compile).toHaveBeenCalledWith(fakeTemplateContent);
            expect(compiledFn).toHaveBeenCalledWith({ title: 'Example' });
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(paths.outputDir, 'output.html'), renderedHtml, 'utf8');
        });
    });
});