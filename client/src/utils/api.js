
export const renewLogin = () => {
    return fetch('/api/user/renew', {
        method: "GET"
    });
}

export const getCategories = async () => {
    const response = await fetch('/api/category/', {
        method: "GET"
    })
    const categories = await response.json();
    return ( 
    <>
    <option value={undefined}>All</option>
        {categories.map(category => (
            <option value={category._id}>{category.category}</option>
        ))}
    </>)
    
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