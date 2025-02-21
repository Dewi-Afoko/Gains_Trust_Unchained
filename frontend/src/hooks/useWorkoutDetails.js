import { useState, useEffect } from 'react'
import axios from 'axios'

const useWorkoutDetails = (workoutId, accessToken) => {
    const [workout, setWorkout] = useState(null)
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
    }, [workoutId, accessToken])

    // ✅ Update a single set in state and handle new additions
    const updateSingleSet = (updatedSet) => {
        setSets((prevSets) => {
            if (updatedSet.deleted) {
                return prevSets.filter((set) => set.id !== updatedSet.id); // ✅ Remove deleted sets
            }
            const existingSet = prevSets.find((set) => set.id === updatedSet.id);
            if (existingSet) {
                return prevSets.map((set) =>
                    set.id === updatedSet.id ? updatedSet : set
                );
            }
            return [...prevSets, updatedSet]; // ✅ Add new sets to the array
        });
    }

    return { workout, sets, loading, error, setWorkout, updateSingleSet }
}

export default useWorkoutDetails
