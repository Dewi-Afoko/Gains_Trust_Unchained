import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ workoutId, accessToken, children }) => {
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
                setSets(setsResponse.data.sets);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching workout data');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkoutDetails();
    }, [workoutId, accessToken]);

    const updateSingleSet = (updatedSet) => {
        setSets((prevSets) => {
            if (updatedSet.deleted) {
                return prevSets.filter((set) => set.id !== updatedSet.id);
            }
            const existingSet = prevSets.find((set) => set.id === updatedSet.id);
            if (existingSet) {
                return prevSets.map((set) =>
                    set.id === updatedSet.id ? updatedSet : set
                );
            }
            return [...prevSets, updatedSet];
        });
    };

    return (
        <WorkoutContext.Provider value={{ workout, sets, loading, error, setWorkout, updateSingleSet }}>
            {children}
        </WorkoutContext.Provider>
    );
};

export const useWorkoutContext = () => {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkoutContext must be used within a WorkoutProvider');
    }
    return context;
};