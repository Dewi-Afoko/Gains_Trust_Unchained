import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
    getWorkouts,
    getWorkoutById,
    updateWorkout as apiUpdateWorkout,
    deleteWorkout as apiDeleteWorkout,
    duplicateWorkout as apiDuplicateWorkout,
    startWorkout as apiStartWorkout,
    completeWorkout as apiCompleteWorkout,
} from '../api/workoutsApi'
import {
    getSetsByWorkoutId,
    createSet,
    updateSet as apiUpdateSet,
    deleteSet as apiDeleteSet,
    completeSet,
    skipSet as apiSkipSet,
    moveSet as apiMoveSet,
} from '../api/setsApi'
import { showToast } from '../utils/toast'

const useWorkoutStore = create(
    devtools(
        (set, get) => ({
            workouts: [],
            workoutSets: {},
            workout: null,
            sets: [],
            loading: false,
            error: null,
            pagination: { count: 0, next: null, previous: null },

            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),

            fetchAllWorkouts: async (page = 1) => {
                set({ loading: true })
                try {
                    const data = await getWorkouts({ page })
                    if (data && Array.isArray(data.results)) {
                        set({ 
                            workouts: data.results,
                            pagination: {
                                count: data.count,
                                next: data.next,
                                previous: data.previous,
                            }
                        })
                    } else {
                        set({ 
                            workouts: [],
                            pagination: { count: 0, next: null, previous: null },
                            error: 'Failed to load workouts. Please try again.'
                        })
                    }
                } catch (err) {
                    set({ error: 'Failed to load workouts. Please try again.' })
                } finally {
                    set({ loading: false })
                }
            },

            fetchWorkoutDetails: async (workoutId) => {
                set({ loading: true })
                try {
                    const workoutData = await getWorkoutById(workoutId)
                    const setsData = await getSetsByWorkoutId(workoutId)
                    const allSets = setsData.results || []

                    if (workoutData && !workoutData.id) {
                        set({ 
                            workout: null,
                            error: 'Workout not found.'
                        })
                    } else {
                        set({ 
                            workout: workoutData,
                            sets: allSets,
                            workoutSets: {
                                ...get().workoutSets,
                                [workoutId]: allSets
                            }
                        })
                    }
                } catch (error) {
                    set({ error: 'Error fetching workout details.' })
                } finally {
                    set({ loading: false })
                }
            },

            updateWorkout: async (workoutId, updatedFields) => {
                try {
                    await apiUpdateWorkout(workoutId, updatedFields)
                    await get().fetchWorkoutDetails(workoutId)
                    showToast('Workout updated successfully!', 'success')
                } catch (error) {
                    showToast('Failed to update workout.', 'error')
                }
            },

            startWorkout: async (workoutId) => {
                try {
                    await apiStartWorkout(workoutId)
                    await get().fetchWorkoutDetails(workoutId)
                    showToast('Workout started!', 'success')
                } catch (err) {
                    showToast('Failed to start workout.', 'error')
                }
            },

            toggleComplete: async (workoutId) => {
                try {
                    await apiCompleteWorkout(workoutId)
                    await get().fetchWorkoutDetails(workoutId)
                    await get().fetchAllWorkouts()
                    showToast('Workout completion status updated!', 'success')
                } catch (err) {
                    showToast('Failed to mark workout complete.', 'error')
                }
            },

            deleteWorkout: async (workoutId) => {
                try {
                    await apiDeleteWorkout(workoutId)
                    set(state => ({
                        workouts: state.workouts.filter(w => w.id !== workoutId),
                        workout: null,
                        sets: [],
                        workoutSets: Object.fromEntries(
                            Object.entries(state.workoutSets).filter(([id]) => id !== workoutId)
                        )
                    }))
                    showToast('Workout deleted successfully!', 'success')
                } catch (error) {
                    showToast('Failed to delete workout.', 'error')
                }
            },

            duplicateWorkout: async (workoutId) => {
                try {
                    const response = await apiDuplicateWorkout(workoutId)
                    const newWorkout = response.workout
                    if (!newWorkout || !newWorkout.id) {
                        throw new Error('Invalid response: Workout data missing.')
                    }
                    set(state => ({
                        workouts: [...state.workouts, newWorkout]
                    }))
                    showToast('Workout duplicated successfully!', 'success')
                    return newWorkout
                } catch (err) {
                    showToast('Failed to duplicate workout.', 'error')
                }
            },

            // Sets Management
            updateSet: async (setId, updatedData) => {
                try {
                    await apiUpdateSet(setId, updatedData)
                    const workoutId = get().workout?.id
                    if (workoutId) {
                        await get().fetchWorkoutDetails(workoutId)
                    }
                    showToast('Set updated successfully!', 'success')
                } catch (err) {
                    showToast('Failed to update set.', 'error')
                    throw err
                }
            },

            toggleSetComplete: async (setId) => {
                const workoutId = get().workout?.id
                if (!workoutId) return

                try {
                    await completeSet(setId)
                    await get().fetchWorkoutDetails(workoutId)
                    showToast('Set completion updated!', 'success')
                } catch (err) {
                    showToast('Failed to update set.', 'error')
                }
            },

            createSets: async (workoutId, setData, numberOfSets = 1) => {
                try {
                    await Promise.all(
                        Array.from({ length: numberOfSets }, () =>
                            createSet({ ...setData, workout: workoutId, complete: false })
                        )
                    )
                    await get().fetchWorkoutDetails(workoutId)
                    showToast(`Added ${numberOfSets} set(s) successfully!`, 'success')
                } catch (error) {
                    showToast('Failed to create sets.', 'error')
                }
            },

            duplicateSet: async (workoutId, setData) => {
                try {
                    await createSet({ ...setData, workout: workoutId, complete: false })
                    await get().fetchWorkoutDetails(workoutId)
                    showToast('Set duplicated successfully!', 'success')
                } catch (error) {
                    showToast('Failed to duplicate set.', 'error')
                }
            },

            deleteSet: async (workoutId, setId) => {
                try {
                    await apiDeleteSet(setId)
                    await get().fetchWorkoutDetails(workoutId)
                    showToast('Set deleted successfully!', 'success')
                } catch (err) {
                    showToast('Failed to delete set.', 'error')
                }
            },

            skipSet: async (setId) => {
                const workoutId = get().workout?.id
                if (!workoutId) return

                try {
                    await apiSkipSet(setId)
                    await get().fetchWorkoutDetails(workoutId)
                    showToast('Set skipped!', 'success')
                } catch (error) {
                    showToast('Failed to skip set.', 'error')
                }
            },

            moveSet: async (setId, newPosition) => {
                const workoutId = get().workout?.id
                if (!workoutId) return

                try {
                    await apiMoveSet(setId, newPosition)
                    await get().fetchWorkoutDetails(workoutId)
                    showToast('Set reordered successfully!', 'success')
                } catch (err) {
                    showToast('Failed to move set.', 'error')
                }
            },

            updateSetsFromAPI: async (workoutId) => {
                if (!workoutId) return

                try {
                    const setsData = await getSetsByWorkoutId(workoutId)
                    if (!setsData || !setsData.results) return

                    set({
                        sets: setsData.results,
                        workoutSets: {
                            ...get().workoutSets,
                            [workoutId]: setsData.results
                        }
                    })
                } catch (error) {
                    showToast('Failed to update sets.', 'error')
                }
            }
        }),
        {
            name: 'workout-store',
            enabled: process.env.NODE_ENV === 'development'
        }
    )
)

export default useWorkoutStore 