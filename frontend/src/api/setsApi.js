import apiClient from './apiClient'

// Sets CRUD
export const getSets = async (params = {}) => {
    const response = await apiClient.get('/sets/', { params })
    return response.data
}

export const getSetById = async (id) => {
    const response = await apiClient.get(`/sets/${id}/`)
    return response.data
}

export const createSet = async (setData) => {
    const response = await apiClient.post('/sets/', setData)
    return response.data
}

export const updateSet = async (id, setData) => {
    const response = await apiClient.patch(`/sets/${id}/`, setData)
    return response.data
}

export const deleteSet = async (id) => {
    const response = await apiClient.delete(`/sets/${id}/`)
    return response.data
}

// Custom actions
export const completeSet = async (id) => {
    const response = await apiClient.patch(`/sets/${id}/complete_set/`)
    return response.data
}

export const skipSet = async (id) => {
    const response = await apiClient.patch(`/sets/${id}/skip_set/`)
    return response.data
}

export const moveSet = async (id, newPosition) => {
    const response = await apiClient.patch(`/sets/${id}/move_set/`, {
        new_position: newPosition,
    })
    return response.data
}
