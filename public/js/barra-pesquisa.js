//Se apertar enter, fecha o teclado no mobile
document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const searchBar = document.getElementById('searchBar');
    searchBar.blur();
});

//Pesquisa em tempo real (sem precisar apertar enter)
document.getElementById('searchBar').addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();

    const faqItems = document.querySelectorAll('.faq-item');
    let faqVisibleCount = 0;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question').textContent.trim().toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.trim().toLowerCase();

        if (question.includes(query) || answer.includes(query)) {
            item.style.display = ''; // Exibe o item do FAQ
            faqVisibleCount++;
        } else {
            item.style.display = 'none'; // Oculta o item do FAQ
        }
    });

    const listItems = document.querySelectorAll('ul li');
    let listVisibleCount = 0;

    listItems.forEach(item => {
        const title = item.querySelector('span').textContent.trim().toLowerCase();
        if (title.includes(query)) {
            item.style.display = ''; // Exibe o item da lista
            listVisibleCount++;
        } else {
            item.style.display = 'none'; // Oculta o item da lista
        }
    });

    //Nenhum resultado encontrado
    const totalVisibleCount = faqVisibleCount + listVisibleCount;
    if (totalVisibleCount === 0) {
        if (!document.getElementById('noResultsMessage')) {
            const message = document.createElement('p');
            message.id = 'noResultsMessage';
            message.textContent = 'Nenhum resultado encontrado.';
            message.style.color = '#999';
            message.style.textAlign = 'center';
            document.querySelector('.container').appendChild(message);
        }
    } else {
        const noResultsMessage = document.getElementById('noResultsMessage');
        if (noResultsMessage) noResultsMessage.remove();
    }
});