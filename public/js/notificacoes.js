const isNotificationRead = (id) => {
    const readNotices = JSON.parse(localStorage.getItem('readNotices')) || [];
    return readNotices.includes(id);
};

const markNotificationAsRead = (id) => {
    const readNotices = JSON.parse(localStorage.getItem('readNotices')) || [];
    if (!readNotices.includes(id)) {
        readNotices.push(id);
        localStorage.setItem('readNotices', JSON.stringify(readNotices));
    }
};

const updateNotificationClasses = () => {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach((notification) => {
        const id = notification.dataset.id;
        if (isNotificationRead(id)) {
            notification.classList.add('read');
        }
    });
};

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('mark-as-read')) {
        const id = e.target.dataset.id;
        markNotificationAsRead(id);

        const notification = document.querySelector(`.notification[data-id="${id}"]`);
        if (notification) {
            notification.classList.add('read');
        }
    }
});

updateNotificationClasses();