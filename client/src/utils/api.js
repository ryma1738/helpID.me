
export const renewLogin = () => {
    return fetch('/api/user/renew', {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    });
}

export const getCategories = async () => {
    const response = await fetch('/api/category/', {
        method: "GET"
    });
    const categories = await response.json();
    return ( 
    <>
    <option value="">All</option>
        {categories.map(category => (
            <option value={category._id}>{category.category}</option>
        ))}
    </>)
}

export const getZipCoords = (zipCode) => {
    return fetch('/api/post/zip/' + zipCode, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    });
}

export const checkNotifications = () => {
    return fetch('/api/notification/', {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    });
}

export const markAsRead = (id) => {
    return fetch(`/api/notification/${id}`, {
        method: "PUT",
        headers: {
            'content-type': 'application/json'
        }
    })
}

export const deleteNotification = (id) => {
    return fetch(`/api/notification/${id}`, {
        method: "DELETE",
        headers: {
            'content-type': 'application/json'
        }
    })
}

export const getAllPosts = (lon = "", lat = "", maxDistance = "", page = 1, limit = "", sort = "Most Recent", categoryId = "", subCategory = "" ) => {
    return fetch(`/api/post/?categoryId=${categoryId}&subCategory=${subCategory}&sort=${sort}&limit=${limit}&page=${page}&lon=${lon}&lat=${lat}&maxDistance=${maxDistance}`, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    });
}

export const getOnePost = (postId) => {
    return fetch(`/api/post/${postId}`, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    })
}

export const login = (email, password) => {
    return fetch(`/api/user/login`, {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
}

export const signup = (username, phoneNumber, email, password) => {
    return fetch(`/api/user/signup`, {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            username: username,
            password: password,
            phoneNumber: phoneNumber === "" ? undefined : phoneNumber
        })
    })
}

export const logout = () => {
    return fetch(`/api/user/logout`, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    });
}

export const getUserInfo = () => {
    return fetch(`/api/user/`, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    })
}

export const updateAccount = (username, email, password, phoneNumber) => {
    return fetch(`/api/user/`, {
        method: "PUT",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            username: username === "" ? undefined : username,
            email: email === "" ? undefined : email,
            password: password === "" ? undefined : password,
            phoneNumber: phoneNumber === "" ? undefined : phoneNumber
        })
    })
}

export const createTip = (formData) => {
    return fetch('/api/tip/', {
        method: "POST",
        body: formData
    })
}