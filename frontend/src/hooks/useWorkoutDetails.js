import { useState, useEffect } from 'react'
import axios from 'axios'

const useWorkoutDetails = (workoutId, accessToken) => {
    const [workout, setWorkout] = useState(null)
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false) // Tracks updates

    useEffect(() => {
        const fetchWorkoutDetails = async () => {
            setLoading(true)
            try {
                const workoutResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                )
                setWorkout(workoutResponse.data)

                const setsResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                )
                setSets(setsResponse.data.sets)
            } catch (err) {
                setError(
                    err.response?.data?.message || 'Error fetching workout data'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchWorkoutDetails()
    }, [workoutId, accessToken, isUpdating])

    return { workout, sets, loading, error, setWorkout, setIsUpdating }
}

export default useWorkoutDetails
