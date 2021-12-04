
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

export const getAllPosts = (categoryId = "", subCategory = "", lon = "", lat = "", maxDistance="", sort = "Most Recent" ) => {
    return fetch(`/api/post/?categoryId=${categoryId}&subCategory=${subCategory}&sort=${sort}&limit=20&page=2&lon=-112.027238&lat=40.321024&maxDistance=250`, {
        method: "GET"
    });
}