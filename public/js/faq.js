document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        button.classList.toggle('active');
        if (button.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + "px";
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
        const faqId = faqItem.id;
        const faqQuestion = faqItem.querySelector('.faq-question').textContent.trim();
        const currentUrl = `${window.location.origin}${window.location.pathname}#${faqId}`;

        const whatsappLink = `https://wa.me/?text=${encodeURIComponent(faqQuestion)}%0A%0A${encodeURIComponent(currentUrl)}`;

        const whatsappIcon = faqItem.querySelector('.share-icon.whatsapp');
        whatsappIcon.href = whatsappLink;
    });
});

//Scrolla para a pergunta do FAQ e abre a resposta
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash) {
        const faqId = window.location.hash.substring(1);
        const targetFaq = document.getElementById(faqId);

        if (targetFaq) {
            targetFaq.scrollIntoView({ behavior: 'smooth' });

            const faqAnswer = targetFaq.querySelector('.faq-answer');
            if (faqAnswer && faqAnswer.style.display === 'none') {
                faqAnswer.style.display = 'block';
            }
        }
    }
});
