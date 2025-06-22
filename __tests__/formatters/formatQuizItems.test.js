const formatQuizItems = require('../../src/formatters/quizFormatter')

describe('formatQuizItems', () => {
    it('format a Quiz question with 1 correct answer', () => {
        const input = [
            [
                "Question 1",
                "Alternative A",
                "Alternative B",
                "Alternative C",
                "Alternative D",
                "A",
                "Question feedback (explanation)",
                "Easy",
                "Diabetes (medical condition)",
                "5da36c78-71cc-4396-a49d-2c9389e0a714"
            ]
        ]

        const result = formatQuizItems(input)
        expect(result).toStrictEqual([{
            question: "Question 1",
            alternatives: [
                {
                    key: "A",
                    value: "Alternative A",
                    isCorrect: true
                },
                {
                    key: "B",
                    value: "Alternative B",
                    isCorrect: false
                },
                {
                    key: "C",
                    value: "Alternative C",
                    isCorrect: false
                },
                {
                    key: "D",
                    value: "Alternative D",
                    isCorrect: false
                }
            ],
            explanation: "Question feedback (explanation)",
            corrects: ["A"],
            difficulty: "Easy",
            category: "Diabetes (medical condition)",
            id: "5da36c78-71cc-4396-a49d-2c9389e0a714"
        }])
    })

    it('format a Quiz question with 4 correct answers', () => {
        const input = [
            [
                "Question 1",
                "Alternative A",
                "Alternative B",
                "Alternative C",
                "Alternative D",
                "A, B,C,   D",
                "Question feedback (explanation)",
                "Easy",
                "Diabetes (medical condition)",
                "5da36c78-71cc-4396-a49d-2c9389e0a714"
            ]
        ]

        const result = formatQuizItems(input)
        expect(result).toStrictEqual([{
            question: "Question 1",
            alternatives: [
                {
                    key: "A",
                    value: "Alternative A",
                    isCorrect: true
                },
                {
                    key: "B",
                    value: "Alternative B",
                    isCorrect: true
                },
                {
                    key: "C",
                    value: "Alternative C",
                    isCorrect: true
                },
                {
                    key: "D",
                    value: "Alternative D",
                    isCorrect: true
                }
            ],
            explanation: "Question feedback (explanation)",
            corrects: ["A", "B", "C", "D"],
            difficulty: "Easy",
            category: "Diabetes (medical condition)",
            id: "5da36c78-71cc-4396-a49d-2c9389e0a714"
        }])
    })

    it('format a Quiz question with only 2 answers', () => {
        const input = [
            [
                "Question 1",
                "Alternative A",
                "Alternative B",
                "",
                "",
                "B",
                "Question feedback (explanation)",
                "Easy",
                "Diabetes (medical condition)",
                "5da36c78-71cc-4396-a49d-2c9389e0a714"
            ]
        ]

        const result = formatQuizItems(input)
        expect(result).toStrictEqual([{
            question: "Question 1",
            alternatives: [
                {
                    key: "A",
                    value: "Alternative A",
                    isCorrect: false
                },
                {
                    key: "B",
                    value: "Alternative B",
                    isCorrect: true
                }
            ],
            explanation: "Question feedback (explanation)",
            corrects: ["B"],
            difficulty: "Easy",
            category: "Diabetes (medical condition)",
            id: "5da36c78-71cc-4396-a49d-2c9389e0a714"
        }])
    })

    it('missing fields in function parameter', () => {
        const input = [
            [
                "",
                "Alternative A",
                "Alternative B",
                "Alternative C",
                "Alternative D",
                "A",
                "Question feedback (explanation)",
                "Easy",
                "Diabetes (medical condition)",
                "5da36c78-71cc-4396-a49d-2c9389e0a714"
            ],
            [
                "Question 2",
                "Alternative A",
                "Alternative B",
                "Alternative C",
                "Alternative D",
                "",
                "Question feedback (explanation)",
                "Easy",
                "Diabetes (medical condition)",
                "5da36c78-71cc-4396-a49d-2c9389e0a714"
            ],
            [
                "Question 3",
                "Alternative A",
                "Alternative B",
                "Alternative C",
                "Alternative D",
                "A",
                "",
                "Easy",
                "Diabetes (medical condition)",
                "5da36c78-71cc-4396-a49d-2c9389e0a714"
            ],
            [
                "Question 4",
                "Alternative A",
                "Alternative B",
                "Alternative C",
                "Alternative D",
                "A",
                "Question feedback (explanation)",
                "Easy",
                "Diabetes (medical condition)",
                ""
            ]
        ]

        const result = formatQuizItems(input)
        expect(result).toStrictEqual([])
    })

    it('less than one answer', () => {
        const input = [
            [
                "Question 1",
                "Alternative A",
                "",
                " ",
                "   ",
                "A",
                "Question feedback (explanation)",
                "Easy",
                "Diabetes (medical condition)",
                "5da36c78-71cc-4396-a49d-2c9389e0a714"
            ]
        ]

        const result = formatQuizItems(input)
        expect(result).toStrictEqual([])
    })
})