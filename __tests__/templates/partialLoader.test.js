jest.mock('fs');
jest.mock('handlebars');

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const registerPartials = require('../../src/templates/partialLoader');
const { paths } = require('../../src/config/constants');

describe('registerPartials', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('register all partials correctly', () => {
        fs.readdirSync.mockReturnValue(['header.html', 'footer.html']);
        fs.readFileSync
            .mockReturnValueOnce('<header>Header</header>')
            .mockReturnValueOnce('<footer>Footer</footer>');

        registerPartials();

        expect(fs.readdirSync).toHaveBeenCalledWith(paths.partialsDir);
        expect(fs.readFileSync).toHaveBeenNthCalledWith(1, path.join(paths.partialsDir, 'header.html'), 'utf8');
        expect(fs.readFileSync).toHaveBeenNthCalledWith(2, path.join(paths.partialsDir, 'footer.html'), 'utf8');

        expect(handlebars.registerPartial).toHaveBeenCalledWith('header', '<header>Header</header>');
        expect(handlebars.registerPartial).toHaveBeenCalledWith('footer', '<footer>Footer</footer>');
    });
});
