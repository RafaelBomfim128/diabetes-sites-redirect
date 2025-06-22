function formatQuizItems(arrItemsSheet) {
    const arrItemsSheetFormatted = arrItemsSheet.map(([question, alternativeA, alternativeB, alternativeC, alternativeD, alternativeCorrect, explanation, difficulty, category, id]) => {
        if (!question || !alternativeCorrect || !explanation || !id) return null;

        const alternativesObj = {
            A: alternativeA,
            B: alternativeB,
            C: alternativeC,
            D: alternativeD
        };

        const corrects = alternativeCorrect.replace(/ e /g, ',')
            .split(/[ ,]+/)
            .map(word => word.trim().toUpperCase())
            .filter(word => word !== '');

        const filteredAlternatives = Object.entries(alternativesObj)
            .filter(([key, value]) => value != null && value.trim() !== '')
            .map(([key, value]) => ({ key, value, isCorrect: corrects.includes(key) }));

        if (filteredAlternatives.length < 2) return null;

        return {
            question,
            alternatives: filteredAlternatives,
            explanation,
            corrects,
            difficulty,
            category,
            id
        }

    }).filter(item => item !== null);

    return arrItemsSheetFormatted;
}

module.exports = formatQuizItems;