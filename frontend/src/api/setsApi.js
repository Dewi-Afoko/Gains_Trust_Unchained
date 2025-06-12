import apiClient from './apiClient'

// Sets CRUD
export const getSets = async (params = {}) => {
    const response = await apiClient.get('/sets/', { params })
    return response.data
}

export const getSetsByWorkoutId = async (workoutId, params = {}) => {
    // First request to get initial data and total count
    const initialResponse = await apiClient.get('/sets/', { 
        params: {
            ...params,
            workout: workoutId,
            page: 1
        }
    })

    const { count, results } = initialResponse.data
    let allSets = [...results]

    // Calculate number of additional pages needed based on the actual page size we received
    const actualPageSize = results.length
    const totalPages = Math.ceil(count / actualPageSize)

    // Fetch remaining pages if any
    if (totalPages > 1) {
        const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
        
        // Fetch each page sequentially to ensure order
        for (const page of remainingPages) {
            const response = await apiClient.get('/sets/', {
                params: {
                    ...params,
                    workout: workoutId,
                    page
                }
            })
            const pageResults = response.data.results
            allSets = [...allSets, ...pageResults]
        }
    }

    // Return in the same format as the API, but with all results
    return {
        ...initialResponse.data,
        results: allSets,
        next: null, // Since we've fetched everything
        previous: null
    }
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

export const duplicateSet = async (setId) => {
    const response = await apiClient.post(`/sets/${setId}/duplicate/`)
    return response.data
}
