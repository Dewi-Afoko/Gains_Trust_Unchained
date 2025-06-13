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
    duplicateSet,
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
            isLoading: false,
            pagination: { count: 0, next: null, previous: null },

            // Computed properties
            completeSets: () => get().sets.filter((set) => set.complete),
            incompleteSets: () => get().sets.filter((set) => !set.complete),

            // Computed helper for getting sets by workout ID
            getSetsByWorkoutId: (workoutId) =>
                get().workoutSets[workoutId] || [],

            // Helper to get exercise counts for a workout (needed for old behavior)
            getExerciseCounts: (workoutId) => {
                const sets = get().workoutSets[workoutId] || []
                return sets.reduce((acc, set) => {
                    acc[set.exercise_name] = (acc[set.exercise_name] || 0) + 1
                    return acc
                }, {})
            },

            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),

            fetchAllWorkouts: async () => {
                set({ loading: true, error: null })
                try {
                    let allWorkouts = []
                    let currentPage = 1
                    let hasNextPage = true

                    while (hasNextPage) {
                        const data = await getWorkouts({ page: currentPage })
                        if (data && Array.isArray(data.results)) {
                            allWorkouts = [...allWorkouts, ...data.results]
                            hasNextPage = data.next !== null
                            currentPage += 1
                        } else {
                            hasNextPage = false
                        }
                    }

                    set({
                        workouts: allWorkouts,
                        pagination: {
                            count: allWorkouts.length,
                            next: null,
                            previous: null,
                        },
                    })

                    // Fetch sets for all workouts to populate workoutSets lookup
                    await get().fetchAllWorkoutSets(allWorkouts)
                } catch (err) {
                    set({
                        error: 'Failed to load workouts. Please try again.',
                        workouts: [],
                        pagination: { count: 0, next: null, previous: null },
                    })
                } finally {
                    set({ loading: false })
                }
            },

            // New function to fetch sets for all workouts (needed for exercise counts in WorkoutFeedFull)
            fetchAllWorkoutSets: async (workouts) => {
                try {
                    const workoutSetsPromises = workouts.map(
                        async (workout) => {
                            try {
                                const setsData = await getSetsByWorkoutId(
                                    workout.id
                                )
                                return { [workout.id]: setsData.results || [] }
                            } catch (error) {
                                console.warn(
                                    `Failed to fetch sets for workout ${workout.id}:`,
                                    error
                                )
                                return { [workout.id]: [] }
                            }
                        }
                    )

                    const workoutSetsArray =
                        await Promise.all(workoutSetsPromises)
                    const workoutSetsMap = Object.assign(
                        {},
                        ...workoutSetsArray
                    )

                    set({ workoutSets: workoutSetsMap })
                } catch (error) {
                    console.error('Error fetching workout sets:', error)
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
                            error: 'Workout not found.',
                        })
                    } else {
                        set({
                            workout: workoutData,
                            sets: allSets,
                            workoutSets: {
                                ...get().workoutSets,
                                [workoutId]: allSets,
                            },
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
                    set((state) => ({
                        workouts: state.workouts.filter(
                            (w) => w.id !== workoutId
                        ),
                        workout:
                            state.workout?.id === workoutId
                                ? null
                                : state.workout,
                        sets: state.workout?.id === workoutId ? [] : state.sets,
                        workoutSets: Object.fromEntries(
                            Object.entries(state.workoutSets).filter(
                                ([id]) => id !== workoutId.toString()
                            )
                        ),
                    }))
                    showToast('Workout deleted successfully!', 'success')
                } catch (error) {
                    showToast('Failed to delete workout.', 'error')
                    throw error
                }
            },

            duplicateWorkout: async (workoutId) => {
                try {
                    const response = await apiDuplicateWorkout(workoutId)
                    const newWorkout = response.workout
                    if (!newWorkout || !newWorkout.id) {
                        throw new Error(
                            'Invalid response: Workout data missing.'
                        )
                    }
                    set((state) => ({
                        workouts: [...state.workouts, newWorkout],
                    }))
                    showToast('Workout duplicated successfully!', 'success')
                    return newWorkout
                } catch (err) {
                    showToast('Failed to duplicate workout.', 'error')
                    throw err
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
                    const promises = Array.from(
                        { length: numberOfSets },
                        () => {
                            const newSetData = {
                                ...setData,
                                workout: workoutId,
                                complete: false,
                                set_duration: null,
                                set_start_time: null,
                                is_active_set: false,
                            }
                            return createSet(newSetData)
                        }
                    )

                    await Promise.all(promises)
                    await get().fetchWorkoutDetails(workoutId)
                    showToast(
                        `Added ${numberOfSets} set(s) successfully!`,
                        'success'
                    )
                } catch (error) {
                    showToast('Failed to create sets.', 'error')
                    throw error
                }
            },

            duplicateSet: async (workoutId, setData) => {
                if (!workoutId || !setData?.id) {
                    showToast(
                        'Cannot duplicate set: Missing required data',
                        'error'
                    )
                    throw new Error('Missing required data for set duplication')
                }
                try {
                    await duplicateSet(setData.id)
                    await get().fetchWorkoutDetails(workoutId)
                } catch (error) {
                    showToast('Failed to duplicate set.', 'error')
                    throw error
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
                } catch (err) {
                    showToast('Failed to skip set.', 'error')
                }
            },

            moveSet: async (setId, newPosition) => {
                const workoutId = get().workout?.id
                if (!workoutId) return

                try {
                    await apiMoveSet(setId, newPosition)
                    await get().fetchWorkoutDetails(workoutId)
                    showToast('Set order updated!', 'success')
                } catch (err) {
                    showToast('Failed to move set.', 'error')
                }
            },

            updateSetsFromAPI: async (workoutId) => {
                if (!workoutId) return
                try {
                    const setsData = await getSetsByWorkoutId(workoutId)
                    set((state) => ({
                        sets: setsData.results || [],
                        workoutSets: {
                            ...state.workoutSets,
                            [workoutId]: setsData.results || [],
                        },
                    }))
                } catch (err) {
                    showToast('Failed to update sets.', 'error')
                }
            },

            // New actions
            fetchWorkouts: async () => {
                set({ isLoading: true, error: null })
                try {
                    const workouts = await getWorkouts()
                    set({ workouts, isLoading: false })
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    showToast('Failed to fetch workouts', 'error')
                }
            },

            createWorkout: async (workoutData) => {
                set({ isLoading: true, error: null })
                try {
                    const newWorkout = await apiUpdateWorkout(null, workoutData)
                    set((state) => ({
                        workouts: [...state.workouts, newWorkout],
                        isLoading: false,
                    }))
                    showToast('Workout created successfully', 'success')
                } catch (error) {
                    set({ error: error.message, isLoading: false })
                    showToast('Failed to create workout', 'error')
                    throw error
                }
            },

            clearWorkouts: () => {
                set({ workouts: [], isLoading: false, error: null })
            },
        }),
        {
            name: 'workout-store',
            enabled: process.env.NODE_ENV === 'development',
        }
    )
)

export default useWorkoutStore
