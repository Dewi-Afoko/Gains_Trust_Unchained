import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
    Play,
    Pause,
    CheckCircle2,
    Clock,
    Activity,
    AlertCircle
} from 'lucide-react'
import useWorkoutStore from '../stores/workoutStore'
import useTimerStore from '../stores/timerStore'
import TimerLive from '../components/livetracking/TimerLive'
import SetTrackerLive from '../components/livetracking/SetTrackerLive'
import WorkoutControlsLive from '../components/livetracking/WorkoutControlsLive'
import WorkoutTimerDisplay from '../components/livetracking/WorkoutTimerDisplay'
import PanelButton from '../components/ui/PanelButton'
import { getWorkoutById } from '../api/workoutsApi'
import industrialTexture from '../assets/industrial-texture.png'
import texture2 from '../assets/texture2.png'

export default function LiveTracking() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isInitialMount = useRef(true)

    // State for tracking side panel expansion
    const [leftPanelExpanded, setLeftPanelExpanded] = useState(true)
    const [rightPanelExpanded, setRightPanelExpanded] = useState(true)

    const { 
        workout, 
        sets, 
        fetchWorkoutDetails, 
        startWorkout, 
        toggleComplete,
        toggleSetComplete,
        startTimer,
        stopTimer
    } = useWorkoutStore()

    const {
        timeElapsed,
        isResting,
        startWorkoutTimer,
        stopWorkoutTimer,
        startRestTimer,
        stopRestTimer,
        hydrateRestTimer,
        cleanupTimers,
        formatTime
    } = useTimerStore()

    // Use React Query for the workout data
    const { data: workoutData, isLoading, error } = useQuery({
        queryKey: ['workout', id],
        queryFn: () => getWorkoutById(id),
        enabled: !!id
    })

    // Initialize workout when data loads
    useEffect(() => {
        if (workoutData && id) {
            fetchWorkoutDetails(id)
            // Don't auto-start workout anymore - user must click "Start Workout"
            // Only load existing timers if workout was already started
            if (workoutData.start_time) {
                startWorkoutTimer(id)
            }
        }
    }, [workoutData, id, fetchWorkoutDetails, startWorkoutTimer])

    // Hydrate rest timer after Zustand rehydrates
    useEffect(() => {
        console.log('📱 LiveTracking hydrate effect running, workoutData:', !!workoutData, 'id:', id)
        if (workoutData && id) {
            console.log('📱 Calling hydrateRestTimer')
            // Hydrate rest timer immediately - Zustand persist handles the timing
            hydrateRestTimer()
        }
    }, [workoutData, id, hydrateRestTimer])

    // Cleanup on unmount ONLY - prevent running on initial mount
    useEffect(() => {
        console.log('📱 LiveTracking cleanup effect setup for id:', id, 'isInitialMount:', isInitialMount.current)
        
        // Mark that we've mounted
        if (isInitialMount.current) {
            isInitialMount.current = false
            return // Don't set up cleanup on initial mount
        }
        
        return () => {
            console.log('📱 LiveTracking cleanup effect running for id:', id)
            // Only cleanup when truly unmounting (navigating away)
            if (id) {
                cleanupTimers(id)
            }
        }
    }, [id]) // Only when id changes (navigation to different workout)

    // Get next incomplete set
    const nextSet = sets?.find(set => !set.complete)
    
    // Calculate workout progress
    const completedSets = sets?.filter(set => set.complete).length || 0
    const totalSets = sets?.length || 0
    const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

    const handleStartRest = (duration) => {
        startRestTimer(duration)
    }

    const handleStartWorkout = async () => {
        try {
            await startWorkout(id)
            startWorkoutTimer(id)
        } catch (error) {
            console.error('Error starting workout:', error)
        }
    }

    const handleCompleteWorkout = async () => {
        try {
            await toggleComplete(id)
            stopWorkoutTimer()
            navigate('/workouts')
        } catch (error) {
            console.error('Error completing workout:', error)
        }
    }

    // Calculate intelligent positioning for Workout Overview
    const getWorkoutOverviewPosition = () => {
        // On mobile, always use normal positioning (panels are stacked below)
        // On desktop, check panel expansion states
        return {
            mobile: 'mt-8 mb-16',
            desktop: (!leftPanelExpanded && !rightPanelExpanded) 
                ? 'lg:mt-8 lg:mb-16' // Both collapsed - normal position
                : 'lg:mt-36 lg:mb-16' // At least one expanded - proper spacing (9rem = 144px)
        }
    }

    const positionClasses = getWorkoutOverviewPosition()

    if (error) {
        return (
            <main className="min-h-screen w-full relative overflow-hidden">
                {/* Background Texture */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none z-0"
                    style={{ backgroundImage: `url(${industrialTexture})` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-brand-dark-2/90 to-black/95 opacity-90 z-10"></div>
                
                {/* Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-red-400 mb-4">Workout Not Found</h1>
                        <p className="text-gray-400 mb-6">The workout you&apos;re trying to track doesn&apos;t exist or has been deleted.</p>
                        <PanelButton 
                            onClick={() => navigate('/workouts')}
                            variant="danger"
                        >
                            Return to Workouts
                        </PanelButton>
                    </div>
                </div>
            </main>
        )
    }

    if (isLoading) {
        return (
            <main className="min-h-screen w-full relative overflow-hidden">
                {/* Background Texture */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none z-0"
                    style={{ backgroundImage: `url(${industrialTexture})` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-brand-dark-2/90 to-black/95 opacity-90 z-10"></div>
                
                {/* Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen w-full relative overflow-hidden">
            {/* Background Texture */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none z-0"
                style={{ backgroundImage: `url(${industrialTexture})` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-brand-dark-2/90 to-black/95 opacity-90 z-10"></div>
            
            {/* Absolute positioned side panels - Outside main container */}
            {/* Left - Next 3 Sets - Absolute to viewport left edge, scrolls with page */}
            <div className="hidden lg:block absolute left-4 top-20 w-80 z-30 pb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <SetTrackerLive 
                        showNextOnly={true} 
                        onExpandChange={setLeftPanelExpanded}
                    />
                </motion.div>
            </div>

            {/* Right - Last 3 Sets - Absolute to viewport right edge, scrolls with page */}
            <div className="hidden lg:block absolute right-4 top-20 w-80 z-30 pb-8">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <SetTrackerLive 
                        showCompletedOnly={true} 
                        onExpandChange={setRightPanelExpanded}
                    />
                </motion.div>
            </div>
            
            {/* Content */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    {/* Title with flanking set columns */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6 relative"
                    >
                        {/* Desktop Layout - Center content only */}
                        <div className="hidden lg:block">
                            {/* Center - Title, Time Elapsed, Progress, and Timer */}
                            <div className="mx-auto max-w-3xl px-4">
                                <h1 className="text-4xl lg:text-5xl font-bold gains-font bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] mb-6">
                                    {workout?.workout_name || 'Live Tracking'}
                                </h1>
                                
                                {/* Timer Display and Progress - above the timer */}
                                <div className="mb-8">
                                    <WorkoutTimerDisplay timeElapsed={timeElapsed} workout={workout} />
                                    
                                    {/* Progress Bar */}
                                    <div className="max-w-md mx-auto mt-6">
                                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                                            <span className="font-medium">Progress</span>
                                            <span className="font-medium">{completedSets}/{totalSets} sets</span>
                                        </div>
                                        <div className="w-full bg-brand-dark-2 border border-brand-gold/30 rounded-full h-3 relative overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.5 }}
                                                className="bg-gradient-to-r from-yellow-400 via-yellow-600 to-orange-700 h-full rounded-full"
                                            />
                                            {/* Add metal rivets */}
                                            <span className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                                            <span className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                                        </div>
                                    </div>
                                </div>

                                {/* Connected Timer and Current Set Info */}
                                <div className="relative">
                                    {/* Current Set Header - connected to main card */}
                                    <div className="bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e] border border-brand-gold/80 rounded-t-2xl p-4 mb-0"
                                        style={{
                                            backgroundImage: `linear-gradient(to bottom, rgba(234,179,8,0.18) 0%, #1a1a1a 40%, #0e0e0e 100%), url(${texture2})`,
                                            backgroundBlendMode: 'overlay, multiply',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="w-2 h-2 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                                            <span className="font-extrabold uppercase tracking-wider text-lg bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
                                                {isResting ? 'Next Set' : (workout?.start_time ? 'Current Set' : 'Ready to Start')}
                                            </span>
                                            <span className="w-2 h-2 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                                        </div>
                                    </div>

                                    {/* Main Timer Card - connected to header */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="border-t-0"
                                    >
                                        <TimerLive 
                                            nextSet={nextSet} 
                                            workoutStarted={!!workout?.start_time}
                                            onStartWorkout={handleStartWorkout}
                                            hideHeader={true}
                                        />
                                    </motion.div>
                                </div>

                                {/* Complete Workout Button */}
                                {progress === 100 && (
                                    <div className="mt-6">
                                        <PanelButton
                                            onClick={handleCompleteWorkout}
                                            variant="gold"
                                            className="max-w-xs mx-auto"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Complete Workout
                                        </PanelButton>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="lg:hidden">
                            {/* Title */}
                            <h1 className="text-4xl font-bold gains-font bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] mb-6">
                                {workout?.workout_name || 'Live Tracking'}
                            </h1>
                            
                            {/* Timer Display and Progress */}
                            <div className="mb-6">
                                <WorkoutTimerDisplay timeElapsed={timeElapsed} workout={workout} />
                                
                                {/* Progress Bar */}
                                <div className="max-w-md mx-auto mt-4">
                                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                                        <span className="font-medium">Progress</span>
                                        <span className="font-medium">{completedSets}/{totalSets} sets</span>
                                    </div>
                                    <div className="w-full bg-brand-dark-2 border border-brand-gold/30 rounded-full h-3 relative overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-gradient-to-r from-yellow-400 via-yellow-600 to-orange-700 h-full rounded-full"
                                        />
                                        {/* Add metal rivets */}
                                        <span className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                                        <span className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                                    </div>
                                </div>
                            </div>

                            {/* Timer */}
                            <div className="mb-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <TimerLive 
                                        nextSet={nextSet} 
                                        workoutStarted={!!workout?.start_time}
                                        onStartWorkout={handleStartWorkout}
                                    />
                                </motion.div>
                            </div>

                            {/* Complete Workout Button */}
                            {progress === 100 && (
                                <div className="mt-6">
                                    <PanelButton
                                        onClick={handleCompleteWorkout}
                                        variant="gold"
                                        className="max-w-xs mx-auto"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Complete Workout
                                    </PanelButton>
                                </div>
                            )}

                            {/* Mobile versions - stacked vertically */}
                            <div className="space-y-6 mt-8">
                                <div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <SetTrackerLive showNextOnly={true} />
                                    </motion.div>
                                </div>
                                <div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <SetTrackerLive showCompletedOnly={true} />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Status Messages */}
                {nextSet && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed bottom-6 right-6 bg-brand-dark-2 border border-brand-gold/40 backdrop-blur-sm p-4 rounded-xl shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-yellow-400" />
                            <div>
                                <p className="text-yellow-400 font-semibold">Next Up:</p>
                                <p className="text-gray-300">{nextSet.exercise_name} - Set {nextSet.set_order}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Workout Controls - Full Width with Smart Positioning (Outside main container) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`relative z-20 ${positionClasses.mobile} ${positionClasses.desktop} px-4 lg:px-[21rem]`}
            >
                <div className="w-full">
                    <WorkoutControlsLive />
                </div>
            </motion.div>
        </main>
    )
} 