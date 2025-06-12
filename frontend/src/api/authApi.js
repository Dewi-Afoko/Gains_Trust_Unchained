import apiClient from './apiClient'

export const login = async (username, password) => {
    const response = await apiClient.post('/users/login/', {
        username,
        password,
    })
    return response.data
}

export const register = async (userData) => {
    const response = await apiClient.post('/users/register/', userData)
    return response.data
}

export const logout = async (refreshToken) => {
    const response = await apiClient.post('/users/logout/', {
        refresh: refreshToken,
    })
    return response.data
}

export const refreshToken = async (refreshToken) => {
    const response = await apiClient.post('/users/token/refresh/', {
        refresh: refreshToken,
    })
    return response.data
}
