import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useTimerStore = create(
    devtools(
        persist(
            (set, get) => ({
                // Workout timer state
                timeElapsed: 0,
                timerInterval: null,
                
                // Rest timer state - now persisted automatically
                restTimeLeft: 0,
                restInterval: null,
                isResting: false,
                restStartTime: null,
                restDuration: null,
                
                // Set timer state
                setTimeElapsed: 0,
                setInterval: null,
                isTrackingSet: false,
                
                // Manual set start tracking - for non-auto-start mode
                manuallyStartedSets: {}, // { setId: true/false }
                
                // Current workout ID for localStorage keys
                currentWorkoutId: null,

                // Workout timer functions
                startWorkoutTimer: (workoutId) => {
                    const state = get()
                    if (state.timerInterval) return // Already running
                    
                    set({ currentWorkoutId: workoutId })
                    
                    // Check if there's a saved timer for this workout
                    const savedStartTime = localStorage.getItem(`workoutStartTime_${workoutId}`)
                    if (savedStartTime) {
                        const startTime = parseInt(savedStartTime, 10)
                        const elapsed = Math.floor((Date.now() - startTime) / 1000)
                        set({ timeElapsed: elapsed })
                    } else {
                        // First time starting - save start time
                        localStorage.setItem(`workoutStartTime_${workoutId}`, Date.now().toString())
                        set({ timeElapsed: 0 })
                    }

                    const interval = setInterval(() => {
                        set(state => ({ timeElapsed: state.timeElapsed + 1 }))
                    }, 1000)
                    set({ timerInterval: interval })
                },

                stopWorkoutTimer: () => {
                    const state = get()
                    if (state.timerInterval) {
                        clearInterval(state.timerInterval)
                        set({ timerInterval: null })
                    }
                },

                resetWorkoutTimer: (workoutId = null) => {
                    const state = get()
                    get().stopWorkoutTimer()
                    set({ timeElapsed: 0 })
                    
                    const workoutIdToUse = workoutId || state.currentWorkoutId
                    if (workoutIdToUse) {
                        localStorage.removeItem(`workoutStartTime_${workoutIdToUse}`)
                    }
                },

                // Rest timer functions - now with Zustand persist
                startRestTimer: (duration) => {
                    const state = get()
                    if (state.restInterval) {
                        clearInterval(state.restInterval)
                    }

                    const startTime = Date.now()

                    set({ 
                        restTimeLeft: duration,
                        isResting: true,
                        restStartTime: startTime,
                        restDuration: duration
                    })

                    const interval = setInterval(() => {
                        const state = get()
                        const elapsed = Math.floor((Date.now() - state.restStartTime) / 1000)
                        const remaining = Math.max(state.restDuration - elapsed, 0)
                        
                        set({ restTimeLeft: remaining })
                        
                        if (remaining === 0) {
                            get().stopRestTimer()
                        }
                    }, 1000)
                    
                    set({ restInterval: interval })
                },

                stopRestTimer: () => {
                    const state = get()
                    if (state.restInterval) {
                        clearInterval(state.restInterval)
                    }
                    
                    // Clear previous set timer data to prevent flashing
                    get().clearPreviousSetTimerData()
                    
                    set({ 
                        restInterval: null,
                        restTimeLeft: 0,
                        isResting: false,
                        restStartTime: null,
                        restDuration: null
                    })
                },

                // Clear previous set timer data from localStorage
                clearPreviousSetTimerData: () => {
                    // Clear all setStartTime entries from localStorage
                    const keys = Object.keys(localStorage)
                    keys.forEach(key => {
                        if (key.startsWith('setStartTime_')) {
                            localStorage.removeItem(key)
                        }
                    })
                },

                // Hydrate rest timer on app load - called after Zustand rehydrates
                hydrateRestTimer: () => {
                    const state = get()
                    
                    if (state.isResting && state.restStartTime && state.restDuration) {
                        const elapsed = Math.floor((Date.now() - state.restStartTime) / 1000)
                        const remaining = Math.max(state.restDuration - elapsed, 0)
                        
                        if (remaining > 0) {
                            // Timer is still valid, continue it
                            set({ restTimeLeft: remaining })

                            const interval = setInterval(() => {
                                const currentState = get()
                                const currentElapsed = Math.floor((Date.now() - currentState.restStartTime) / 1000)
                                const currentRemaining = Math.max(currentState.restDuration - currentElapsed, 0)
                                
                                set({ restTimeLeft: currentRemaining })
                                
                                if (currentRemaining === 0) {
                                    get().stopRestTimer()
                                }
                            }, 1000)
                            
                            set({ restInterval: interval })
                        } else {
                            // Timer has expired, clean up
                            get().stopRestTimer()
                        }
                    }
                },

                // Set timer functions (for tracking individual set duration)
                startSetTimer: () => {
                    const state = get()
                    if (state.setInterval) return // Already running
                    
                    set({ setTimeElapsed: 0, isTrackingSet: true })
                    
                    const interval = setInterval(() => {
                        set(state => ({ setTimeElapsed: state.setTimeElapsed + 1 }))
                    }, 1000)
                    
                    set({ setInterval: interval })
                },

                stopSetTimer: () => {
                    const state = get()
                    if (state.setInterval) {
                        clearInterval(state.setInterval)
                    }
                    set({ 
                        setInterval: null,
                        isTrackingSet: false 
                    })
                    return get().setTimeElapsed // Return the final time
                },

                resetSetTimer: () => {
                    get().stopSetTimer()
                    set({ setTimeElapsed: 0 })
                },

                // Manual set start tracking functions
                markSetAsManuallyStarted: (setId) => {
                    set(state => ({
                        manuallyStartedSets: {
                            ...state.manuallyStartedSets,
                            [setId]: true
                        }
                    }))
                },

                isSetManuallyStarted: (setId) => {
                    const state = get()
                    return !!state.manuallyStartedSets[setId]
                },

                clearManualSetStart: (setId) => {
                    set(state => {
                        const newManuallyStartedSets = { ...state.manuallyStartedSets }
                        delete newManuallyStartedSets[setId]
                        return { manuallyStartedSets: newManuallyStartedSets }
                    })
                },

                // Cleanup function for when leaving a workout
                cleanupTimers: (workoutId) => {
                    get().stopWorkoutTimer()
                    get().stopRestTimer()
                    get().stopSetTimer()
                    set({ 
                        currentWorkoutId: null,
                        manuallyStartedSets: {} // Clear manual set starts on cleanup
                    })
                },

                // Format time helper
                formatTime: (seconds) => {
                    const hours = Math.floor(seconds / 3600)
                    const minutes = Math.floor((seconds % 3600) / 60)
                    const secs = seconds % 60
                    
                    if (hours > 0) {
                        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                    } else {
                        return `${minutes}:${secs.toString().padStart(2, '0')}`
                    }
                }
            }),
            {
                name: 'timer-storage',
                // Only persist rest timer state and manual set starts, not intervals or workout timer
                partialize: (state) => ({
                    restTimeLeft: state.restTimeLeft,
                    isResting: state.isResting,
                    restStartTime: state.restStartTime,
                    restDuration: state.restDuration,
                    manuallyStartedSets: state.manuallyStartedSets,
                }),
                // Skip hydration during SSR
                skipHydration: false,
            }
        ),
        {
            name: 'timer-store',
            enabled: process.env.NODE_ENV === 'development'
        }
    )
)

export default useTimerStore 