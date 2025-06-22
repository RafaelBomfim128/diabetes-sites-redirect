const formatNotificationsData = require('../../src/formatters/notificationsFormatter')

describe('formatNotificationsData', () => {
    it('formats the Notifications correctly', () => {
        const input = [['Notification 1', 'Content 1', '20/12/2018', 'f5ad3a12-2798-4388-a01c-926016e696f1']]
        const result = formatNotificationsData(input)
        expect(result).toMatchObject([{
            title: 'Notification 1',
            content: 'Content 1',
            date: '20/12/2018',
            id: 'f5ad3a12-2798-4388-a01c-926016e696f1'
        }])
    })

    it('missing fields in function parameter', () => {
        const input = [
            ['', 'Content 1', '20/12/2018', 'f5ad3a12-2798-4388-a01c-926016e696f1'],
            ['Notification 1', '', '20/12/2018', 'f5ad3a12-2798-4388-a01c-926016e696f1'],
            ['Notification 1', 'Content 1', '', 'f5ad3a12-2798-4388-a01c-926016e696f1'],
            ['Notification 1', 'Content 1', '20/12/2018', '']
        ]
        const result = formatNotificationsData(input)
        expect(result).toEqual([])
    })

    it('replaces all line breaks to <br>', () => {
        const input = [['Notification 1', 'In this content, has\ntwo\nline breaks', '20/12/2018', 'f5ad3a12-2798-4388-a01c-926016e696f1']]
        const result = formatNotificationsData(input)
        expect(result[0].content).toEqual('In this content, has<br>two<br>line breaks')
    })
})