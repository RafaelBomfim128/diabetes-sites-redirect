const formatPath = require('../../src/utils/formatPath');

describe('formatPath', () => {
    it('remove accents, spaces and special characters', () => {
        expect(formatPath(' Path Áçcêntúàted 123! ')).toBe('path-accentuated-123');
    });

    it('convert to lowercase and replaces spaces with hyphens', () => {
        expect(formatPath('Path Example 123')).toBe('path-example-123');
    });

    it('removes disallowed characters', () => {
        expect(formatPath('Path@#%$&*()')).toBe('path');
    });

    it('handles already cleaned strings', () => {
        expect(formatPath('already-cleaned')).toBe('already-cleaned');
    });
});