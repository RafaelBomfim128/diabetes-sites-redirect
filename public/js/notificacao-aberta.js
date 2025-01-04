document.addEventListener("DOMContentLoaded", () => {
    const notificationElement = document.querySelector(".notification-opened");
    const notificationId = notificationElement?.dataset.id;

    if (notificationId) {
        let readNotifications = JSON.parse(localStorage.getItem("readNotifications")) || [];

        if (!readNotifications.includes(notificationId)) {
            readNotifications.push(notificationId);
            localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
        }

        if (notificationId === window.env.MOST_RECENT_NOTIFICATION_ID) {
            localStorage.setItem("lastViewedNotification", notificationId);
            const notificationIcon = document.getElementById("notification-icon");
            notificationIcon.src = "./img/sino.png";
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const currentUrl = encodeURIComponent(window.location.href);
    const notificationTitle = document.querySelector('.notification-title').textContent.trim();

    document.querySelector('.share-icon.whatsapp').href = `https://wa.me/?text=${encodeURIComponent(notificationTitle)}%0A%0A${currentUrl}`;
});