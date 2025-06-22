function formatNotificationsData(arrItemsSheet) {
    arrItemsSheet = arrItemsSheet.reverse();
    const arrItemsSheetFormatted = arrItemsSheet
        .filter(([title, content, date, id]) => title && content && date && id)
        .map(([title, content, date, id]) => {
            content = content.replace(/\n/g, '<br>');
            return { title, content, date, id };
        });
    return arrItemsSheetFormatted;
}

module.exports = formatNotificationsData