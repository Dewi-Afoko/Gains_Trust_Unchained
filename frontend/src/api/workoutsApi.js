import apiClient from './apiClient'

// Workouts CRUD
export const getWorkouts = async (params = {}) => {
    const response = await apiClient.get('/workouts/', { params })
    return response.data
}

export const getWorkoutById = async (id) => {
    const response = await apiClient.get(`/workouts/${id}/`)
    return response.data
}

export const createWorkout = async (workoutData) => {
    const response = await apiClient.post('/workouts/', workoutData)
    return response.data
}

export const updateWorkout = async (id, workoutData) => {
    const response = await apiClient.patch(`/workouts/${id}/`, workoutData)
    return response.data
}

export const deleteWorkout = async (id) => {
    const response = await apiClient.delete(`/workouts/${id}/`)
    return response.data
}

// Custom actions
export const duplicateWorkout = async (id) => {
    const response = await apiClient.post(`/workouts/${id}/duplicate/`)
    return response.data
}

export const startWorkout = async (id) => {
    const response = await apiClient.patch(`/workouts/${id}/start_workout/`)
    return response.data
}

export const completeWorkout = async (id) => {
    const response = await apiClient.patch(`/workouts/${id}/complete_workout/`)
    return response.data
}
