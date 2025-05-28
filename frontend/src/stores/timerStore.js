import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useTimerStore = create(
    devtools(
        (set, get) => ({
            // Workout timer state
            timeElapsed: 0,
            timerInterval: null,
            
            // Rest timer state
            restTimeLeft: 0,
            restInterval: null,
            isResting: false,
            
            // Set timer state
            setTimeElapsed: 0,
            setInterval: null,
            isTrackingSet: false,
            
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

            // Rest timer functions
            startRestTimer: (duration, workoutId) => {
                const state = get()
                if (state.restInterval) {
                    clearInterval(state.restInterval)
                }

                const startTime = Date.now()
                localStorage.setItem(`restStartTime_${workoutId}`, startTime.toString())
                localStorage.setItem(`restDuration_${workoutId}`, duration.toString())

                set({ 
                    restTimeLeft: duration,
                    isResting: true 
                })

                const interval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000)
                    const remaining = Math.max(duration - elapsed, 0)
                    
                    set({ restTimeLeft: remaining })
                    
                    if (remaining === 0) {
                        get().stopRestTimer(workoutId)
                    }
                }, 1000)
                
                set({ restInterval: interval })
            },

            stopRestTimer: (workoutId) => {
                const state = get()
                if (state.restInterval) {
                    clearInterval(state.restInterval)
                }
                
                set({ 
                    restInterval: null,
                    restTimeLeft: 0,
                    isResting: false 
                })
                
                if (workoutId) {
                    localStorage.removeItem(`restStartTime_${workoutId}`)
                    localStorage.removeItem(`restDuration_${workoutId}`)
                }
            },

            // Check for existing rest timer on load
            loadRestTimer: (workoutId) => {
                const savedStartTime = localStorage.getItem(`restStartTime_${workoutId}`)
                const savedDuration = localStorage.getItem(`restDuration_${workoutId}`)
                
                if (savedStartTime && savedDuration) {
                    const startTime = parseInt(savedStartTime, 10)
                    const duration = parseInt(savedDuration, 10)
                    const elapsed = Math.floor((Date.now() - startTime) / 1000)
                    const remaining = Math.max(duration - elapsed, 0)
                    
                    if (remaining > 0) {
                        get().startRestTimer(remaining, workoutId)
                    } else {
                        // Timer already finished, clean up
                        localStorage.removeItem(`restStartTime_${workoutId}`)
                        localStorage.removeItem(`restDuration_${workoutId}`)
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

            // Cleanup function for when leaving a workout
            cleanupTimers: (workoutId) => {
                get().stopWorkoutTimer()
                get().stopRestTimer(workoutId)
                get().stopSetTimer()
                set({ currentWorkoutId: null })
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
            name: 'timer-store',
            enabled: process.env.NODE_ENV === 'development'
        }
    )
)

export default useTimerStore 