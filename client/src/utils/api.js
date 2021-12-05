
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

export const getAllPosts = (lon = "", lat = "", maxDistance = "", page = 1, limit = "", sort = "Most Recent", categoryId = "", subCategory = "" ) => {
    console.log(`/api/post/?categoryId=${categoryId}&subCategory=${subCategory}&sort=${sort}&limit=${limit}&page=${page}&lon=${lon}&lat=${lat}&maxDistance=${maxDistance}`)
    return fetch(`/api/post/?categoryId=${categoryId}&subCategory=${subCategory}&sort=${sort}&limit=${limit}&page=${page}&lon=${lon}&lat=${lat}&maxDistance=${maxDistance}`, {
        method: "GET"
    });
}