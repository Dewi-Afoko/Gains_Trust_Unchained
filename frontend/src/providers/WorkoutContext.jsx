import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthContext } from './AuthContext'
import { showToast } from '../utils/toast'
import { differenceInSeconds } from 'date-fns'
import {
    getWorkouts,
    getWorkoutById,
    createWorkout,
    updateWorkout as apiUpdateWorkout,
    deleteWorkout as apiDeleteWorkout,
    duplicateWorkout as apiDuplicateWorkout,
    startWorkout as apiStartWorkout,
    completeWorkout as apiCompleteWorkout,
} from '../api/workoutsApi'
import {
    getSets,
    getSetById,
    createSet,
    updateSet as apiUpdateSet,
    deleteSet as apiDeleteSet,
    completeSet,
    skipSet as apiSkipSet,
    moveSet as apiMoveSet,
} from '../api/setsApi'

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
    const [timeElapsed, setTimeElapsed] = useState(0) // ⏳ Track elapsed time
    const [pagination, setPagination] = useState([])

    // ✅ Automatically fetch workouts or details based on `workoutId`
    useEffect(() => {
        if (workoutId) {
            fetchWorkoutDetails(workoutId)
        } else {
            fetchAllWorkouts()
        }
    }, [workoutId])

    useEffect(() => {
        if (workout?.start_time) {
            const startTime = new Date(workout.start_time)
            setTimeElapsed(differenceInSeconds(new Date(), startTime))

            const interval = setInterval(() => {
                setTimeElapsed(differenceInSeconds(new Date(), startTime))
            }, 1000)

            return () => clearInterval(interval) // ✅ Cleanup on unmount
        } else {
            setTimeElapsed(0) // ✅ Reset when no `start_time`
        }
    }, [workout?.start_time, workout?.id]) // ✅ Runs when `start_time` updates

    // 📌 WORKOUT FUNCTIONS

    const fetchAllWorkouts = async (page = 1) => {
        setLoading(true)
        try {
            const data = await getWorkouts({ page })
            if (data && Array.isArray(data.results)) {
                setWorkouts(data.results)
                setPagination({
                    count: data.count,
                    next: data.next,
                    previous: data.previous,
                })
            } else {
                setWorkouts([])
                setPagination({ count: 0, next: null, previous: null })
                setError('Failed to load workouts. Please try again.')
            }
        } catch (err) {
            setError('Failed to load workouts. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const fetchWorkoutDetails = async (requestedWorkoutId) => {
        setLoading(true)
        try {
            const workoutData = await getWorkoutById(requestedWorkoutId)
            const setsData = await getSets({ workout: requestedWorkoutId })
            const allSets = setsData.results || []
            // Only update if still the latest requested workoutId
            if (requestedWorkoutId === workoutId) {
                if (workoutData && !workoutData.id) {
                    setWorkout(null)
                    setError('Workout not found.')
                } else {
                    setWorkout(workoutData)
                }
                setSets(allSets)
                setWorkoutSets((prev) => ({
                    ...prev,
                    [requestedWorkoutId]: allSets,
                }))
            }
        } catch (error) {
            setError('Error fetching workout details.')
        } finally {
            setLoading(false)
        }
    }

    const updateWorkout = async (workoutId, updatedFields) => {
        await apiUpdateWorkout(workoutId, updatedFields)
        await fetchWorkoutDetails(workoutId)
        showToast('Workout updated successfully!', 'success')
    }

    const startWorkout = async (workoutId) => {
        try {
            setTimeElapsed(0)
            await apiStartWorkout(workoutId)
            await fetchWorkoutDetails(workoutId)
            showToast('Workout started!', 'success')
        } catch (err) {
            showToast('Failed to start workout.', 'error')
        }
    }

    const toggleComplete = async (workoutId) => {
        try {
            await apiCompleteWorkout(workoutId)
            await fetchWorkoutDetails(workoutId)
            await fetchAllWorkouts()
            showToast('Workout completion status updated!', 'success')
        } catch (err) {
            showToast('Failed to mark workout complete.', 'error')
        }
    }

    const deleteWorkout = async (workoutId) => {
        await apiDeleteWorkout(workoutId)
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId))
        setWorkout(null)
        setSets([])
        setWorkoutSets((prev) => {
            const updated = { ...prev }
            delete updated[workoutId]
            return updated
        })
        showToast('Workout deleted successfully!', 'success')
    }

    const duplicateWorkout = async (workoutId) => {
        try {
            const response = await apiDuplicateWorkout(workoutId)
            const newWorkout = response.workout
            if (!newWorkout || !newWorkout.id) {
                throw new Error('Invalid response: Workout data missing.')
            }
            setWorkouts((prev) => [...prev, newWorkout])
            showToast('Workout duplicated successfully!', 'success')
            return newWorkout
        } catch (err) {
            showToast('Failed to duplicate workout.', 'error')
        }
    }

    // 📌 SET FUNCTIONS

    const updateSet = async (setId, updatedData) => {
        if (!accessToken || !workout?.id) return
        try {
            await apiUpdateSet(setId, updatedData)
            await fetchWorkoutDetails(workout.id)
            showToast('Set updated successfully!', 'success')
        } catch (err) {
            console.error('❌ Error updating set:', err)
            showToast('Failed to update set.', 'error')
            throw err
        }
    }

    const toggleSetComplete = async (setId, currentState) => {
        if (!workout?.id) return
        try {
            await completeSet(setId)
            await fetchWorkoutDetails(workout.id)
            showToast('Set completion updated!', 'success')
        } catch (err) {
            console.error('❌ Error updating set completion:', err)
            showToast('Failed to update set.', 'error')
        }
    }

    const createSets = async (workoutId, setData, numberOfSets = 1) => {
        await Promise.all(
            Array.from({ length: numberOfSets }, () =>
                createSet({ ...setData, workout: workoutId, complete: false })
            )
        )
        await fetchWorkoutDetails(workoutId)
        showToast(`Added ${numberOfSets} set(s) successfully!`, 'success')
    }

    const duplicateSet = async (workoutId, setData) => {
        await createSet({ ...setData, workout: workoutId, complete: false })
        await fetchWorkoutDetails(workoutId)
        showToast('Set duplicated successfully!', 'success')
    }

    const deleteSet = async (workoutId, setId) => {
        if (!accessToken) return
        try {
            await apiDeleteSet(setId)
            await fetchWorkoutDetails(workoutId)
            showToast('Set deleted successfully!', 'success')
        } catch (err) {
            console.error('❌ Error deleting set:', err)
            showToast('Failed to delete set.', 'error')
        }
    }

    const fetchSetDetails = async (setId) => {
        if (!workout?.id) return null // ✅ Prevent unnecessary requests
        return await getSetById(setId)
    }

    const updateSetsFromAPI = async (workoutId) => {
        if (!workoutId) {
            console.error(
                '❌ updateSetsFromAPI called with no valid workout ID'
            )
            return
        }
        try {
            const setsData = await getSets({ workout: workoutId })
            if (!setsData || !setsData.results) {
                console.error('❌ API response missing expected data:', setsData)
                return
            }
            setSets([])
            setTimeout(() => setSets(setsData.results), 0)
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
            await apiSkipSet(setId)
            await fetchWorkoutDetails(id)
            showToast('Set skipped!', 'success')
        } catch (error) {
            console.error('❌ Error skipping set:', error)
            showToast('Failed to skip set.', 'error')
        }
    }

    const moveSet = async (setId, newPosition) => {
        if (!accessToken || !workout?.id) return
        if (newPosition < 1 || newPosition > sets.length) return
        try {
            await apiMoveSet(setId, newPosition)
            await fetchWorkoutDetails(workout.id)
            showToast('Set reordered successfully!', 'success')
        } catch (err) {
            console.error('❌ Error moving set:', err)
            showToast('Failed to move set.', 'error')
        }
    }

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
                duplicateWorkout,
                startWorkout,
                timeElapsed,
                updateSet,
                toggleSetComplete,
                createSets,
                duplicateSet,
                deleteSet,
                fetchSetDetails,
                skipSet,
                updateSetsFromAPI,
                moveSet,
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
