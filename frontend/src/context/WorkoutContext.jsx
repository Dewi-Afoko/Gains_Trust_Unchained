import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthContext } from './AuthContext'
import toast from 'react-hot-toast'
import { differenceInSeconds } from 'date-fns'

const WorkoutContext = createContext()

export const WorkoutProvider = ({ workoutId, children }) => {
    const { accessToken } = useAuthContext()
    const [workouts, setWorkouts] = useState([])
    const [workoutSets, setWorkoutSets] = useState({})
    const [workout, setWorkout] = useState(null)
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [completeSets, setCompleteSets] = useState([])
    const [incompleteSets, setIncompleteSets] = useState([])
    const [timeElapsed, setTimeElapsed] = useState(0); // ⏳ Track elapsed time


    // ✅ Centralized API request helper function
    const apiRequest = async (method, url, data = {}) => {
        if (!accessToken) return
        try {
            const response = await axios({
                method,
                url,
                data,
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            return response.data
        } catch (err) {
            console.error(`❌ API Error (${method.toUpperCase()} ${url}):`, err)
            toast.error('Something went wrong. Please try again.')
            throw err
        }
    }

    // ✅ Automatically fetch workouts or details based on `workoutId`
    useEffect(() => {
        workoutId ? fetchWorkoutDetails(workoutId) : fetchAllWorkouts()
    }, [workoutId])

    useEffect(() => {
        if (workout?.start_time) {
            const startTime = new Date(workout.start_time);
            setTimeElapsed(differenceInSeconds(new Date(), startTime));
    
            const interval = setInterval(() => {
                setTimeElapsed(differenceInSeconds(new Date(), startTime));
            }, 1000);
    
            return () => clearInterval(interval); // ✅ Cleanup on unmount
        } else {
            setTimeElapsed(0); // ✅ Reset when no `start_time`
        }
    }, [workout?.start_time, workout?.id]); // ✅ Runs when `start_time` updates
    

    // 📌 WORKOUT FUNCTIONS

    const fetchAllWorkouts = async () => {
        setLoading(true)
        try {
            const data = await apiRequest(
                'get',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/`
            )
            setWorkouts(data.workouts || [])

            // ✅ Fetch sets for all workouts and store them in `workoutSets`
            const setsData = await Promise.all(
                data.workouts.map(async (workout) => {
                    const workoutData = await apiRequest(
                        'get',
                        `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout.id}/sets/`
                    )
                    return { [workout.id]: workoutData.sets || [] }
                })
            )

            // ✅ Merge all sets into `workoutSets`
            setWorkoutSets(Object.assign({}, ...setsData))
        } finally {
            setLoading(false)
        }
    }

    const fetchWorkoutDetails = async (workoutId) => {
        setLoading(true)
        try {
            const data = await apiRequest(
                'get',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`
            )

            setWorkout(data.workout)
            setSets(data.sets || [])

            // ✅ Ensure workoutSets is also updated for the selected workout
            setWorkoutSets((prev) => ({
                ...prev,
                [workoutId]: data.sets || [],
            }))
            console.log('🔄 Fetching workout details...')
            console.log('✅ Received complete sets:', data.complete_sets)
            console.log('✅ Received incomplete sets:', data.incomplete_sets)

            // ✅ Add new functionality without removing anything else
            setIncompleteSets(data.incomplete_sets || [])
            setCompleteSets(data.complete_sets || [])
        } finally {
            setLoading(false)
        }
    }

    const updateWorkout = async (workoutId, updatedFields) => {
        await apiRequest(
            'patch',
            `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
            updatedFields
        )
        await fetchWorkoutDetails(workoutId) // ✅ Ensures the latest data is fetched
        toast.success('Workout updated successfully!')
    }

    const startWorkout = async (workoutId) => {
        if (!accessToken) return;
        try {
            setTimeElapsed(0); // ✅ Reset immediately for UI update

            await apiRequest(
                'patch',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/start/`,
                {}
            );
    
            console.log(`🔄 Fetching updated workout details after starting workout ${workoutId}...`);
            await fetchWorkoutDetails(workoutId); // ✅ Ensure UI updates
    
            toast.success('Workout started!');
        } catch (err) {
            console.error('❌ Error starting workout:', err);
            toast.error('Failed to start workout.');
        }
    };
    
    
    



    const toggleComplete = async (workoutId) => {
        if (!accessToken) return;
        try {
            await apiRequest(
                'patch',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/complete/`,
                {}
            );
    
            await fetchWorkoutDetails(workoutId); // ✅ Force re-fetch of workout details
            await fetchAllWorkouts(); // ✅ Force UI re-render by fetching fresh data

    
            toast.success('Workout completion status updated!');
        } catch (err) {
            console.error('❌ Error updating workout completion:', err);
            toast.error('Failed to mark workout complete.');
        }
    };
    
    

    const deleteWorkout = async (workoutId) => {
        await apiRequest(
            'delete',
            `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`
        )
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId))
        setWorkout(null)
        setSets([])
        setWorkoutSets((prev) => {
            const updated = { ...prev }
            delete updated[workoutId]
            return updated
        })
        toast.success('Workout deleted successfully!')
    }

    const duplicateWorkout = async (workoutId) => {
        if (!accessToken) return;
    
        try {
            const response = await apiRequest("post", `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/duplicate/`);
            const newWorkout = response.workout;
    
            if (!newWorkout || !newWorkout.id) {
                throw new Error("Invalid response: Workout data missing.");
            }
    
            // ✅ Update state with the duplicated workout immediately
            setWorkouts((prev) => [...prev, newWorkout]);
    
            toast.success("Workout duplicated successfully!");
            return newWorkout; // ✅ Return the new workout for immediate UI updates
        } catch (err) {
            console.error("❌ Error duplicating workout:", err);
            toast.error("Failed to duplicate workout.");
        }
    };
    
    

    // 📌 SET FUNCTIONS

    const updateSet = async (setId, updatedData) => {
        if (!accessToken || !workout?.id) return
        try {
            await apiRequest(
                'patch',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout.id}/sets/${setId}/`,
                updatedData
            )
            await fetchWorkoutDetails(workout.id)
            toast.success('Set updated successfully!')
        } catch (err) {
            console.error('❌ Error updating set:', err)
            toast.error('Failed to update set.')
            throw err
        }
    }

    const toggleSetComplete = async (setId, currentState) => {
        if (!workout?.id) return

        try {
            await apiRequest(
                'patch',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout.id}/sets/${setId}/complete/`
            )

            console.log(
                `🔄 Fetching updated workout details for workout ${workout.id}...`
            )
            await fetchWorkoutDetails(workout.id) // ✅ Ensure complete/incomplete sets refresh

            toast.success('Set completion updated!')
        } catch (err) {
            console.error('❌ Error updating set completion:', err)
            toast.error('Failed to update set.')
        }
    }

    const createSets = async (workoutId, setData, numberOfSets = 1) => {
        await Promise.all(
            Array.from({ length: numberOfSets }, () =>
                apiRequest(
                    'post',
                    `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`,
                    { ...setData, complete: false }
                )
            )
        )
        await fetchWorkoutDetails(workoutId)
        toast.success(`Added ${numberOfSets} set(s) successfully!`)
    }

    const duplicateSet = async (workoutId, setData) => {
        await apiRequest(
            'post',
            `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`,
            { ...setData, complete: false }
        )
        await fetchWorkoutDetails(workoutId)
        toast.success('Set duplicated successfully!')
    }

    const deleteSet = async (workoutId, setId) => {
        if (!accessToken) return
        try {
            await apiRequest(
                'delete',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/`
            )
            await fetchWorkoutDetails(workoutId)
            toast.success('Set deleted successfully!')
        } catch (err) {
            console.error('❌ Error deleting set:', err)
            toast.error('Failed to delete set.')
        }
    }

    const fetchSetDetails = async (setId) => {
        if (!workout?.id) return null // ✅ Prevent unnecessary requests
        return await apiRequest(
            'get',
            `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout.id}/sets/${setId}/`
        )
    }

    const updateSetsFromAPI = async (workoutId) => {
        if (!workoutId) {
            console.error(
                '❌ updateSetsFromAPI called with no valid workout ID'
            )
            return
        }

        try {
            const response = await apiRequest(
                'get',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`
            )

            if (!response || !response.sets) {
                // ✅ Prevents undefined errors
                console.error(
                    '❌ API response missing expected data:',
                    response
                )
                return
            }

            console.log('✅ Successfully fetched updated sets:', response.sets)

            setSets([]) // ✅ Force re-render by clearing first
            setTimeout(() => setSets(response.sets), 0) // ✅ Ensure a state change is detected
        } catch (error) {
            console.error('❌ Error fetching updated sets:', error)
        }
    }

    const skipSet = async (setId) => {
        const id = workoutId || workout?.id
        if (!id) {
            console.error('❌ skipSet called with no valid workout ID')
            return
        }

        try {
            await apiRequest(
                'patch',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${id}/sets/${setId}/skip/`
            )

            console.log(
                `🔄 Fetching updated workout details after skipping set ${setId}...`
            )
            await fetchWorkoutDetails(id) // ✅ Ensures complete/incomplete sets update correctly

            toast.success('Set skipped!')
        } catch (error) {
            console.error('❌ Error skipping set:', error)
            toast.error('Failed to skip set.')
        }
    }

    const moveSet = async (setId, newPosition) => {
        if (!accessToken || !workout?.id) return;
    
        // Prevent invalid moves
        if (newPosition < 1 || newPosition > sets.length) return;
    
        try {
            const response = await apiRequest(
                'patch',
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout.id}/sets/${setId}/move/`,
                { new_position: newPosition }
            );
    
            console.log("🔍 API Response:", response);
    
            await fetchWorkoutDetails(workout.id); // ✅ Ensure UI updates correctly
            toast.success('Set reordered successfully!');
        } catch (err) {
            console.error('❌ Error moving set:', err);
            toast.error('Failed to move set.');
        }
    };
    
    
    

    return (
        <WorkoutContext.Provider
            value={{
                workouts,
                workoutSets,
                workout,
                sets,
                completeSets,
                incompleteSets,
                loading,
                error,
                workoutId: workoutId || workout?.id,
                fetchAllWorkouts,
                fetchWorkoutDetails,
                updateWorkout,
                toggleComplete,
                deleteWorkout,
                updateSet,
                toggleSetComplete,
                createSets,
                duplicateSet,
                deleteSet,
                fetchSetDetails,
                skipSet,
                updateSetsFromAPI,
                duplicateWorkout,
                startWorkout,
                timeElapsed,
                moveSet
            }}
        >
            {children}
        </WorkoutContext.Provider>
    )
}

export const useWorkoutContext = () => {
    const context = useContext(WorkoutContext)
    if (!context) {
        throw new Error(
            'useWorkoutContext must be used within a WorkoutProvider'
        )
    }
    return context
}
