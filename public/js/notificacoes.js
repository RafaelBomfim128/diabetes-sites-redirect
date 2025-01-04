const isNotificationRead = (id) => {
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
    return readNotifications.includes(id);
};

const markNotificationAsRead = (id) => {
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
    if (!readNotifications.includes(id)) {
        readNotifications.push(id);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
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

document.addEventListener("DOMContentLoaded", () => {
    const mostRecentNotificationId = window.env.MOST_RECENT_NOTIFICATION_ID;
    localStorage.setItem("lastViewedNotification", mostRecentNotificationId);
    const notificationIcon = document.getElementById("notification-icon");
    notificationIcon.src = "./img/sino.png";
});

updateNotificationClasses();