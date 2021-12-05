
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

export const getAllPosts = (lon = "", lat = "", maxDistance = 50, page = 1, limit = 20, sort = "Most Recent", categoryId = "", subCategory = "" ) => {
    return fetch(`/api/post/?categoryId=${categoryId}&subCategory=${subCategory}&sort=${sort}&limit=${limit}&page=${page}&lon=${lon}&lat=${lat}&maxDistance=${maxDistance}`, {
        method: "GET"
    });
}