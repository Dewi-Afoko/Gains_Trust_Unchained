import { useState, useEffect } from 'react';
import axios from 'axios';

const useWorkoutDetails = (workoutId, accessToken) => {
    const [workout, setWorkout] = useState(null);
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWorkoutDetails = async () => {
            setLoading(true);
            try {
                const workoutResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                setWorkout(workoutResponse.data);

                const setsResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                setSets([...setsResponse.data.sets]); // ✅ Ensure React detects the update
            } catch (err) {
                setError(
                    err.response?.data?.message || 'Error fetching workout data'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchWorkoutDetails();
    }, [workoutId, accessToken]);

    // ✅ Update a single set in state and trigger a state change
    const updateSingleSet = (updatedSet) => {
        setSets((prevSets) => {
            let newSets;
            if (updatedSet.deleted) {
                newSets = prevSets.filter((set) => set.id !== updatedSet.id);
            } else {
                const existingSetIndex = prevSets.findIndex(set => set.id === updatedSet.id);
                if (existingSetIndex !== -1) {
                    newSets = [...prevSets];
                    newSets[existingSetIndex] = updatedSet;
                } else {
                    newSets = [...prevSets, updatedSet];
                }
            }
            return [...newSets]; // ✅ Ensures React detects the state change
        });
    };

    return { workout, sets, loading, error, setWorkout, updateSingleSet, setSets };
};

export default useWorkoutDetails;
