import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Clock, Play, Dumbbell, CheckCircle2, SkipForward, Timer, AlertTriangle } from 'lucide-react'
import useWorkoutStore from '../../stores/workoutStore'
import useTimerStore from '../../stores/timerStore'
import useUserPreferencesStore from '../../stores/userPreferencesStore'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'
import PanelHeader from '../ui/PanelHeader'
import texture2 from '../../assets/texture2.png'
import { motion } from 'framer-motion'

const TimerLive = ({ nextSet, workoutStarted, onStartWorkout, hideHeader = false }) => {
    const { timeElapsed, restTimeLeft, isResting, startRestTimer, stopRestTimer, hydrateRestTimer, markSetAsManuallyStarted, isSetManuallyStarted, clearManualSetStart } = useTimerStore()
    const { toggleSetComplete, skipSet } = useWorkoutStore()
    const { autoStartNextSet } = useUserPreferencesStore()
    const [setTimer, setSetTimer] = useState(0)
    const intervalRefSet = useRef(null)
    const isInitialMount = useRef(true)

    // Load set timer from localStorage
    useEffect(() => {
        if (nextSet?.id && workoutStarted && !isResting) {
            const savedSetStartTime = localStorage.getItem(`setStartTime_${nextSet.id}`)
            if (savedSetStartTime) {
                const elapsed = Math.floor((Date.now() - parseInt(savedSetStartTime)) / 1000)
                setSetTimer(Math.max(elapsed, 0))
            } else {
                setSetTimer(0)
            }
        } else {
            // Reset timer when not in an active set state
            setSetTimer(0)
        }
    }, [nextSet?.id, workoutStarted, isResting])

    // Reset timer when nextSet changes to prevent flashing previous duration
    useEffect(() => {
        setSetTimer(0)
        if (intervalRefSet.current) {
            clearInterval(intervalRefSet.current)
            intervalRefSet.current = null
        }
    }, [nextSet?.id])

    const resetSetTimer = (restart = false) => {
        if (intervalRefSet.current) {
            clearInterval(intervalRefSet.current)
            intervalRefSet.current = null
        }
        setSetTimer(0)

        if (nextSet?.id) {
            localStorage.removeItem(`setStartTime_${nextSet.id}`)
        }

        if (restart && nextSet?.id && workoutStarted && !isResting) {
            const startTime = Date.now()
            localStorage.setItem(`setStartTime_${nextSet.id}`, startTime.toString())
            
            intervalRefSet.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000)
                setSetTimer(elapsed)
            }, 1000)
        }
    }

    // Determine if set timer should be running
    const shouldSetTimerRun = () => {
        if (!workoutStarted || isResting || nextSet?.complete) {
            return false
        }
        
        if (autoStartNextSet) {
            // Auto-start mode: timer runs immediately when rest ends
            return true
        } else {
            // Manual mode: timer only runs if set was manually started
            return nextSet?.id && isSetManuallyStarted(nextSet.id)
        }
    }

    useEffect(() => {
        if (!shouldSetTimerRun()) {
            // Don't run set timer
            resetSetTimer()
            return
        }

        if (nextSet?.id) {
            // Check if timer is already running for this set
            const savedSetStartTime = localStorage.getItem(`setStartTime_${nextSet.id}`)
            if (savedSetStartTime) {
                const elapsed = Math.floor((Date.now() - parseInt(savedSetStartTime)) / 1000)
                setSetTimer(Math.max(elapsed, 0))
                
                // Continue the timer
                intervalRefSet.current = setInterval(() => {
                    const currentElapsed = Math.floor((Date.now() - parseInt(savedSetStartTime)) / 1000)
                    setSetTimer(currentElapsed)
                }, 1000)
            } else if (autoStartNextSet) {
                // Auto-start mode: Start new timer immediately
                resetSetTimer(true)
            }
            // In manual mode, timer only starts when handleStartSet is called
        }

        return () => {
            if (intervalRefSet.current) {
                clearInterval(intervalRefSet.current)
            }
        }
    }, [nextSet?.id, nextSet?.complete, workoutStarted, isResting, autoStartNextSet, shouldSetTimerRun()])

    const formatTime = (seconds) => {
        if (!seconds || seconds < 0 || isNaN(seconds)) {
            return '00:00:00'
        }
        
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60

        const pad = (num) => String(num).padStart(2, '0')
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`
    }

    // Format rest timer for minutes:seconds only
    const formatRestTime = (seconds) => {
        if (!seconds || seconds < 0 || isNaN(seconds)) {
            return '00:00'
        }
        
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        const pad = (num) => String(num).padStart(2, '0')
        return `${pad(minutes)}:${pad(remainingSeconds)}`
    }

    const handleStartSet = () => {
        if (nextSet?.id) {
            // Mark this set as manually started
            markSetAsManuallyStarted(nextSet.id)
            
            // Start the timer
            resetSetTimer(true)
        }
    }

    const handleCompleteSet = () => {
        if (nextSet?.id) {
            // Store the duration for optimistic update
            const duration = setTimer
            localStorage.setItem(`completedSetDuration_${nextSet.id}`, duration.toString())
            
            // Clear manual start tracking for this set
            clearManualSetStart(nextSet.id)
            
            toggleSetComplete(nextSet.id)
            resetSetTimer()
            
            // Start rest timer if this set has a rest period
            if (nextSet.rest) {
                startRestTimer(nextSet.rest)
            }
        }
    }

    const handleSkipSet = () => {
        if (nextSet?.id) {
            // Clear manual start tracking for this set
            clearManualSetStart(nextSet.id)
            skipSet(nextSet.id)
            resetSetTimer()
        }
    }

    // Determine what buttons to show
    const getActionButtons = () => {
        if (!workoutStarted) {
            return (
                <PanelButton
                    onClick={onStartWorkout}
                    variant="gold"
                    className="px-12 py-6 text-2xl font-black"
                >
                    <Play className="w-8 h-8 mr-4" />
                    Start Workout
                </PanelButton>
            )
        }

        if (isResting) {
            return (
                <div className="text-center text-gray-400 italic font-bold text-xl">
                    Resting... {autoStartNextSet 
                        ? 'Set timer will start when rest ends' 
                        : 'Click "Start Set" when ready'
                    }
                </div>
            )
        }

        // Workout started and not resting
        if (!autoStartNextSet && !isSetManuallyStarted(nextSet?.id)) {
            // Manual mode and set hasn't been started yet
            return (
                <>
                    <PanelButton
                        onClick={handleStartSet}
                        variant="gold"
                        className="px-8 py-4 text-xl font-black"
                    >
                        <Play className="w-6 h-6 mr-3" />
                        Start Set
                    </PanelButton>
                    <PanelButton
                        onClick={handleSkipSet}
                        variant="danger"
                        className="px-8 py-4 text-xl font-black"
                    >
                        <SkipForward className="w-6 h-6 mr-3" />
                        Skip Set
                    </PanelButton>
                </>
            )
        } else {
            // Auto mode OR manual mode with set already started
            return (
                <>
                    <PanelButton
                        onClick={handleCompleteSet}
                        variant="gold"
                        className="px-8 py-4 text-xl font-black"
                    >
                        <CheckCircle2 className="w-6 h-6 mr-3" />
                        Complete Set
                    </PanelButton>
                    <PanelButton
                        onClick={handleSkipSet}
                        variant="danger"
                        className="px-8 py-4 text-xl font-black"
                    >
                        <SkipForward className="w-6 h-6 mr-3" />
                        Skip Set
                    </PanelButton>
                </>
            )
        }
    }

    // Dramatic rest timer effects
    const getRestTimerIntensity = () => {
        if (restTimeLeft <= 5) return 'critical' // Last 5 seconds - full screen pulse
        if (restTimeLeft <= 10) return 'urgent'   // 6-10 seconds - very intense
        if (restTimeLeft <= 30) return 'warning' // 11-30 seconds - moderate intensity
        return 'normal'
    }

    const restIntensity = getRestTimerIntensity()

    useEffect(() => {
        return () => {
            if (isInitialMount.current) {
                isInitialMount.current = false
                return // Don't set up cleanup on initial mount
            }
            
            stopRestTimer()
        }
    }, [stopRestTimer])

    // Effect for hydrating rest timer on component mount
    useEffect(() => {
        // Small delay to ensure Zustand has time to rehydrate
        const timer = setTimeout(() => {
            hydrateRestTimer()
        }, 100)

        return () => clearTimeout(timer)
    }, [hydrateRestTimer])

    return (
        <>
            {/* Full Screen Rest Timer Overlay for Critical State - Portal to body */}
            {isResting && restIntensity === 'critical' && createPortal(
                <div className="fixed inset-0 z-[999999] bg-gradient-to-br from-red-600/90 to-orange-600/90 backdrop-blur-sm flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                    <div className="text-center p-16">
                        <div className="flex items-center justify-center gap-8 mb-12">
                            <Timer className="w-32 h-32 text-red-100 animate-bounce" />
                            <h3 className="text-9xl font-black uppercase tracking-wider text-red-50 animate-pulse">
                                Rest Time
                            </h3>
                        </div>
                        <p className="text-[16rem] font-mono font-black text-red-50 animate-pulse leading-none mb-12">
                            {formatRestTime(restTimeLeft)}
                        </p>
                        <p className="text-6xl font-extrabold uppercase tracking-wider text-red-100 animate-bounce">
                            GET READY NOW!
                        </p>
                    </div>
                </div>,
                document.body
            )}

            {/* Main Timer Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-brand-dark-2 border border-brand-gold shadow-lg ${hideHeader ? 'rounded-b-2xl border-t-0' : 'rounded-2xl'} flex flex-col overflow-hidden p-6 text-white relative ${
                    isResting && restIntensity === 'critical' ? 'animate-pulse' : ''
                } ${
                    isResting && restIntensity === 'urgent' ? 'border-red-500 shadow-red-500/30' : 
                        isResting && restIntensity === 'warning' ? 'border-yellow-500 shadow-yellow-500/20' : 
                            'border-brand-gold shadow-brand-gold/10'
                }`}
                style={{
                    minHeight: '400px',
                    boxShadow: isResting && restIntensity === 'critical' 
                        ? '0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)'
                        : isResting && restIntensity === 'urgent'
                            ? '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)'
                            : isResting && restIntensity === 'warning'
                                ? '0 0 15px rgba(234, 179, 8, 0.3), 0 0 30px rgba(234, 179, 8, 0.2)'
                                : undefined,
                }}
            >
                {/* Background Texture */}
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none z-0 rounded-2xl"
                    style={{ 
                        backgroundImage: `linear-gradient(to bottom, rgba(234,179,8,0.18) 0%, #1a1a1a 40%, #0e0e0e 100%), url(${texture2})`,
                        backgroundBlendMode: 'overlay, multiply',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                
                <div className="relative z-20 h-full flex flex-col">
                    {!hideHeader && (
                        <PanelHeader 
                            title={isResting ? 'Next Set' : (workoutStarted ? 'Current Set' : 'Ready to Start')}
                            icon={isResting ? Timer : (workoutStarted ? Dumbbell : Play)}
                            size="large"
                        />
                    )}
                    
                    <div className={`text-center flex-1 flex flex-col justify-center ${
                        isResting && restIntensity === 'critical' ? 'py-16' : 'py-4'
                    }`}>
                        {/* Rest Timer Display */}
                        {isResting && (
                            <div className={`mb-12 p-12 rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-300 ${
                                restIntensity === 'critical' 
                                    ? 'border-2 border-red-500 shadow-red-500/50 bg-brand-dark-2' 
                                    : restIntensity === 'urgent'
                                        ? 'border-2 border-red-500 shadow-red-500/30 bg-brand-dark-2'
                                        : restIntensity === 'warning'
                                            ? 'border-2 border-yellow-500 shadow-yellow-500/20 bg-brand-dark-2'
                                            : 'border border-brand-gold/30 bg-brand-dark-2 shadow-brand-gold/10'
                            }`}
                            style={{
                                boxShadow: restIntensity === 'critical' 
                                    ? '0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)'
                                    : restIntensity === 'urgent'
                                        ? '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)'
                                        : restIntensity === 'warning'
                                            ? '0 0 15px rgba(234, 179, 8, 0.3), 0 0 30px rgba(234, 179, 8, 0.2)'
                                            : undefined,
                                animation: restIntensity === 'critical' 
                                    ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                    : restIntensity === 'urgent'
                                        ? 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                        : restIntensity === 'warning'
                                            ? 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                            : undefined
                            }}>
                                {/* Clean background for rest timer */}
                                <div
                                    className="absolute inset-0 opacity-20 pointer-events-none z-0 rounded-2xl"
                                    style={{
                                        backgroundImage: `url(${texture2})`,
                                        backgroundSize: '200px 200px',
                                        backgroundRepeat: 'repeat'
                                    }}
                                />
                                <div className="relative z-10">
                                    {/* Timer Icon Row - Separate and Bold */}
                                    <div className="flex justify-center mb-6">
                                        <div className={`rounded-full p-6 shadow-2xl ${
                                            restIntensity === 'critical' || restIntensity === 'urgent' 
                                                ? 'bg-gradient-to-b from-red-500 to-red-700' 
                                                : 'bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700'
                                        }`}>
                                            <Timer className={`transition-all duration-300 stroke-[3px] ${
                                                restIntensity === 'critical' ? 'w-24 h-24 text-white' :
                                                    restIntensity === 'urgent' ? 'w-16 h-16 text-white' :
                                                        restIntensity === 'warning' ? 'w-12 h-12 text-black' :
                                                            'w-10 h-10 text-black'
                                            }`} 
                                            style={{
                                                animation: restIntensity === 'critical' 
                                                    ? 'bounce 2s infinite'
                                                    : restIntensity === 'urgent'
                                                        ? 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                        : undefined
                                            }} />
                                        </div>
                                    </div>
                                    
                                    {/* Rest Time Title */}
                                    <div className="flex justify-center mb-8">
                                        <h3 className={`font-black uppercase tracking-wider transition-all duration-300 ${
                                            restIntensity === 'critical' ? 'text-7xl text-red-300' :
                                                restIntensity === 'urgent' ? 'text-4xl text-red-500' :
                                                    restIntensity === 'warning' ? 'text-3xl bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]' :
                                                        'text-2xl bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]'
                                        }`}
                                        style={{
                                            animation: restIntensity === 'critical' 
                                                ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                : undefined
                                        }}>
                                            Rest Time
                                        </h3>
                                    </div>
                                    <p className={`font-mono font-black mb-8 transition-all duration-300 ${
                                        restIntensity === 'critical' ? 'text-[12rem] text-red-200 leading-none' :
                                            restIntensity === 'urgent' ? 'text-8xl text-red-500 leading-none' :
                                                restIntensity === 'warning' ? 'text-6xl bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]' :
                                                    'text-5xl bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]'
                                    }`}
                                    style={{
                                        animation: restIntensity === 'critical' 
                                            ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                            : undefined
                                    }}>
                                        {formatRestTime(restTimeLeft)}
                                    </p>
                                    <p className={`font-extrabold uppercase tracking-wider transition-all duration-300 ${
                                        restIntensity === 'critical' ? 'text-4xl text-red-300' :
                                            restIntensity === 'urgent' ? 'text-2xl text-red-500' :
                                                restIntensity === 'warning' ? 'text-xl bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]' :
                                                    'text-lg bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]'
                                    }`}
                                    style={{
                                        animation: restIntensity === 'critical' 
                                            ? 'bounce 2s infinite'
                                            : restIntensity === 'urgent'
                                                ? 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                : undefined
                                    }}>
                                        {restIntensity === 'critical' ? 'GET READY NOW!' :
                                            restIntensity === 'urgent' ? 'Almost time!' :
                                                restIntensity === 'warning' ? 'Prepare for next set' :
                                                    autoStartNextSet 
                                                        ? 'Next set starts automatically when rest ends'
                                                        : 'Click "Start Set" when ready'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {nextSet && (
                            <div className="max-w-2xl mx-auto">
                                {/* Exercise Name with dynamic styling */}
                                <div className="mb-8">
                                    <h2 className={`font-black uppercase tracking-wide ${
                                        isResting && restIntensity === 'critical' ? 'text-6xl text-red-300' :
                                            isResting && restIntensity === 'urgent' ? 'text-4xl text-red-500' :
                                                isResting && restIntensity === 'warning' ? 'text-3xl bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]' :
                                                    'text-3xl bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]'
                                    }`}>
                                        {nextSet.exercise_name}
                                    </h2>
                                </div>

                                {!isResting && (
                                    <>
                                        <div className="grid grid-cols-3 gap-6 mb-6">
                                            <div className="text-center p-4 bg-black/30 rounded-xl border border-brand-gold/50 shadow-lg shadow-brand-gold/20">
                                                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Set</p>
                                                <p className="text-3xl font-black text-white">{nextSet.set_number}</p>
                                            </div>
                                            <div className="text-center p-4 bg-black/30 rounded-xl border border-brand-gold/50 shadow-lg shadow-brand-gold/20">
                                                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Loading</p>
                                                <p className="text-2xl font-black text-yellow-400">{formatLoading(nextSet.loading)}</p>
                                            </div>
                                            {nextSet.reps && (
                                                <div className="text-center p-4 bg-black/30 rounded-xl border border-brand-gold/50 shadow-lg shadow-brand-gold/20">
                                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Target Reps</p>
                                                    <p className="text-2xl font-black text-green-400">{nextSet.reps}</p>
                                                </div>
                                            )}
                                        </div>

                                        {workoutStarted && shouldSetTimerRun() && (
                                            <div className="text-center p-6 mb-6 bg-black/30 rounded-xl border border-brand-gold/50 shadow-lg shadow-brand-gold/20 relative overflow-hidden">
                                                {/* Set Duration background texture */}
                                                <div
                                                    className="absolute inset-0 opacity-30 pointer-events-none z-0 rounded-xl"
                                                    style={{ 
                                                        backgroundImage: `url(${texture2})`,
                                                        backgroundSize: '200px 200px',
                                                        backgroundRepeat: 'repeat'
                                                    }}
                                                />
                                                <div className="relative z-10">
                                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">Set Duration</p>
                                                    <p className="text-4xl font-mono font-black text-white">
                                                        {formatTime(setTimer)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-6 justify-center">
                                            {getActionButtons()}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default TimerLive
