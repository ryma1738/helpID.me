
export const renewLogin = () => {
    return fetch('/api/user/renew', {
        method: "GET"
    });
}