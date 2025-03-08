document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        button.classList.toggle('active');
        if (button.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + 10 + "px";
            answer.style.paddingTop = "10px";
            answer.style.paddingBottom = "10px";
        } else {
            answer.style.maxHeight = "0";
            answer.style.paddingTop = "0";
            answer.style.paddingBottom = "0";
        }
    });

    button.addEventListener('touchend', () => {
        button.classList.remove('hover');
    });
});

//Compartilhamento de perguntas do FAQ via WhatsApp
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.faq-item').forEach((faqItem) => {
        const faqId = faqItem.getAttribute('data-id');
        const faqQuestion = faqItem.querySelector('.faq-question').textContent.trim();
        const currentUrl = `${window.location.origin}${window.location.pathname}?id=${faqId}`;

        const whatsappLink = `https://wa.me/?text=${encodeURIComponent(faqQuestion)}%0A%0A${encodeURIComponent(currentUrl)}`;

        const whatsappIcon = faqItem.querySelector('.share-icon.whatsapp');
        whatsappIcon.href = whatsappLink;
    });
});

//Scrolla para a pergunta do FAQ e abre a resposta
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const faqId = urlParams.get('id'); // Obtém o parâmetro 'id' da URL

    if (faqId) {
        const targetFaq = document.querySelector(`.faq-item[data-id="${faqId}"]`);

        if (targetFaq) {
            //Scroll
            targetFaq.scrollIntoView({ behavior: 'smooth' });

            //Destaque
            targetFaq.classList.add('highlighted');

            //Abre a resposta
            const button = targetFaq.querySelector('.faq-question');
            const answer = button.nextElementSibling;

            button.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + "px";
            answer.style.paddingTop = "10px";
            answer.style.paddingBottom = "10px";
        }
    }
});