
export const renewLogin = () => {
    return fetch('/api/user/renew', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
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
            'Content-Type': 'application/json'
        }
    });
}

export const checkNotifications = () => {
    return fetch('/api/notification/', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export const getAllPosts = (lon = "", lat = "", maxDistance = "", page = 1, limit = "", sort = "Most Recent", categoryId = "", subCategory = "" ) => {
    console.log(`/api/post/?categoryId=${categoryId}&subCategory=${subCategory}&sort=${sort}&limit=${limit}&page=${page}&lon=${lon}&lat=${lat}&maxDistance=${maxDistance}`)
    return fetch(`/api/post/?categoryId=${categoryId}&subCategory=${subCategory}&sort=${sort}&limit=${limit}&page=${page}&lon=${lon}&lat=${lat}&maxDistance=${maxDistance}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export const login = (email, password) => {
    return fetch(`/api/user/login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
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