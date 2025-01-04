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