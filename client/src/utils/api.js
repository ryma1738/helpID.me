
export const renewLogin = () => {
    return fetch('/api/user/renew', {
        method: "GET"
    });
}

export const checkNotifications = () => {
    return fetch('/api/notification/', {
        method: "GET"
    });
}