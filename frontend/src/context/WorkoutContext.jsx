import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from './AuthContext';
import toast from 'react-hot-toast';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ workoutId, children }) => {
    const { accessToken } = useAuthContext();
    const [workouts, setWorkouts] = useState([]);
    const [workoutSets, setWorkoutSets] = useState({});
    const [workout, setWorkout] = useState(null);
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Centralized API request helper function
    const apiRequest = async (method, url, data = {}) => {
        if (!accessToken) return;
        try {
            const response = await axios({
                method,
                url,
                data,
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (err) {
            console.error(`❌ API Error (${method.toUpperCase()} ${url}):`, err);
            toast.error('Something went wrong. Please try again.');
            throw err;
        }
    };

    // ✅ Automatically fetch workouts or details based on `workoutId`
    useEffect(() => {
        workoutId ? fetchWorkoutDetails(workoutId) : fetchAllWorkouts();
    }, [workoutId]);

    useEffect(() => {
        if (workout?.id) fetchWorkoutSets(workout.id);
    }, [workout]);

    // 📌 WORKOUT FUNCTIONS

    const fetchAllWorkouts = async () => {
        setLoading(true);
        try {
            const data = await apiRequest('get', `${process.env.REACT_APP_API_BASE_URL}/workouts/`);
            setWorkouts(data.workouts || []);
            await Promise.all(data.workouts.map((w) => fetchWorkoutSets(w.id))); // ✅ Fetch sets in parallel
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkoutDetails = async (workoutId) => {
        setLoading(true);
        try {
            const data = await apiRequest('get', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`);
            setWorkout(data);
            await fetchWorkoutSets(workoutId);
        } finally {
            setLoading(false);
        }
    };

    const updateWorkout = async (workoutId, updatedFields) => {
        await apiRequest('patch', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`, updatedFields);
        await fetchWorkoutDetails(workoutId); // ✅ Ensures the latest data is fetched
        toast.success('Workout updated successfully!');
    };

    const toggleComplete = async (workoutId, currentState) => {
        if (!accessToken) return;
        try {
            const response = await apiRequest('patch', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`, {
                complete: !currentState,
            });
    
            setWorkouts((prev) =>
                prev.map((w) => (w.id === workoutId ? { ...w, complete: !currentState } : w))
            );
    
            if (workout?.id === workoutId) {
                setWorkout((prev) => ({ ...prev, complete: !currentState }));
            }
    
            toast.success('Workout completion status updated!');
        } catch (err) {
            console.error('❌ Error updating workout completion:', err);
            toast.error('Failed to update workout.');
        }
    };

    const deleteWorkout = async (workoutId) => {
        await apiRequest('delete', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`);
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
        setWorkout(null);
        setSets([]);
        toast.success('Workout deleted successfully!');
    };

    // 📌 SET FUNCTIONS

    const fetchWorkoutSets = async (workoutId) => {
        const data = await apiRequest('get', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`);
        setWorkoutSets((prev) => ({ ...prev, [workoutId]: data.sets || [] }));
        setSets(data.sets || []);
    };

    const fetchSetDetails = async (setId) => {
        return await apiRequest('get', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout?.id}/sets/${setId}/`);
    };

    const updateSet = async (setId, updatedData) => {
        if (!accessToken || !workout?.id) return;
        try {
            await apiRequest('patch', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout.id}/sets/${setId}/`, updatedData);
            await fetchWorkoutSets(workout.id); // ✅ Ensure `set_number` and `set_order` refresh
            toast.success('Set updated successfully!');
        } catch (err) {
            console.error('❌ Error updating set:', err);
            toast.error('Failed to update set.');
            throw err;
        }
    };
    

    const toggleSetComplete = async (setId, currentState) => {
        const data = await apiRequest('post', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout?.id}/sets/${setId}/complete/`);
        setSets((prev) => prev.map((set) => (set.id === setId ? data.set : set)));
        toast.success('Set completion updated!');
    };

    const createSets = async (workoutId, setData, numberOfSets = 1) => {
        await Promise.all(Array.from({ length: numberOfSets }, () =>
            apiRequest('post', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`, { ...setData, complete: false })
        ));
        await fetchWorkoutSets(workoutId);
        toast.success(`Added ${numberOfSets} set(s) successfully!`);
    };

    const duplicateSet = async (workoutId, setData) => {
        await apiRequest('post', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`, { ...setData, complete: false });
        await fetchWorkoutSets(workoutId);
        toast.success('Set duplicated successfully!');
    };

    const deleteSet = async (workoutId, setId) => {
        if (!accessToken) return;
        try {
            await apiRequest('delete', `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/`);
            await fetchWorkoutSets(workoutId); // ✅ Ensure `set_number` and `set_order` refresh
            toast.success('Set deleted successfully!');
        } catch (err) {
            console.error('❌ Error deleting set:', err);
            toast.error('Failed to delete set.');
        }
    };

    return (
        <WorkoutContext.Provider
            value={{
                workouts,
                workoutSets,
                workout,
                sets,
                loading,
                error,
                fetchAllWorkouts,
                fetchWorkoutDetails,
                fetchWorkoutSets,
                updateWorkout,
                toggleComplete,
                deleteWorkout,
                fetchSetDetails,
                updateSet,
                toggleSetComplete,
                createSets,
                duplicateSet,
                deleteSet,
            }}
        >
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
