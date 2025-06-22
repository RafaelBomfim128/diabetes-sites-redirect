const formatFaqData = require('../../src/formatters/faqFormatter')

describe('formatFaqData', () => {
    it('formats the FAQ correctly', () => {
        const input = [['Question 1', 'Answer 1', '856e7ede-6606-443c-93e8-8d861ae974b0']]
        const result = formatFaqData(input)
        expect(result).toMatchObject([{
            question: 'Question 1',
            answer: 'Answer 1',
            id: '856e7ede-6606-443c-93e8-8d861ae974b0'
        }])
    })

    it('missing fields in function parameter', () => {
        const input = [
            ['', 'Answer 1', '856e7ede-6606-443c-93e8-8d861ae974b0'],
            ['Question 1', '', '856e7ede-6606-443c-93e8-8d861ae974b0'],
            ['Question 1', 'Answer 1', '']
        ]
        const result = formatFaqData(input)
        expect(result).toEqual([])
    })

    it('replaces all line breaks to <br>', () => {
        const input = [['Question 1', 'In this answer, has\ntwo\nline breaks', '856e7ede-6606-443c-93e8-8d861ae974b0']]
        const result = formatFaqData(input)
        expect(result[0].answer).toEqual('In this answer, has<br>two<br>line breaks')
    })
})