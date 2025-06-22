function formatFaqData(arrItemsSheet) {
    const arrItemsSheetFormatted = arrItemsSheet
        .filter(([question, answer, id]) => question && answer && id)
        .map(([question, answer, id]) => {
            answer = answer.replace(/\n/g, '<br>');
            return { question, answer, id };
        });
    return arrItemsSheetFormatted;
}

module.exports = formatFaqData