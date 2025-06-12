import apiClient from './apiClient'

export const getCurrentUser = async () => {
    const response = await apiClient.get('/users/me/')
    return response.data
}

export const updateUser = async (userData) => {
    const response = await apiClient.patch('/users/me/', userData)
    return response.data
}

export const checkAvailability = async ({ username, email }) => {
    const params = {}
    if (username) params.username = username
    if (email) params.email = email
    const response = await apiClient.get('/users/check_availability/', {
        params,
    })
    return response.data
}

// Password Reset functions
export const requestPasswordReset = async (email) => {
    const response = await apiClient.post('/password-reset/request/', { email })
    return response.data
}

export const confirmPasswordReset = async (token, newPassword, confirmPassword) => {
    const response = await apiClient.post('/password-reset/confirm/', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
    })
    return response.data
}

// Weight endpoints
export const getWeights = async () => {
    const response = await apiClient.get('/weights/')
    return response.data
}

export const addWeight = async (weightData) => {
    const response = await apiClient.post('/weights/', weightData)
    return response.data
}

export const updateWeight = async (id, weightData) => {
    const response = await apiClient.patch(`/weights/${id}/`, weightData)
    return response.data
}

export const deleteWeight = async (id) => {
    const response = await apiClient.delete(`/weights/${id}/`)
    return response.data
}

export const deleteUser = async () => {
    // If backend supports /users/me/ DELETE, use that; otherwise, require id
    const response = await apiClient.delete('/users/me/')
    return response.data
}
