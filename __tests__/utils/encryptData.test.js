const { encryptData, decryptData } = require('../../src/utils/encryptData')

describe('encryptData', () => {
    it('encrypt data correctly', () => {
        const key = 'JPF5SJUZHS1VBCH8NY3E8H6U2RKR7404'

        const data = [
            'test string 123',
            [1, 2, 3],
            12345,
            { name: 'Tester' },
            true
        ]

        data.forEach(original => {
            const encrypted = encryptData(original, key)
            expect(encrypted).not.toStrictEqual(original)
            const decrypted = decryptData(encrypted, key)
            expect(decrypted).toStrictEqual(original)
        })
    })
})