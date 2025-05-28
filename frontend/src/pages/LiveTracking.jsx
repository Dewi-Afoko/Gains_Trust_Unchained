import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
    ArrowLeft, 
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
import WorkoutOverview from '../components/livetracking/WorkoutOverview'
import WorkoutControlsLive from '../components/livetracking/WorkoutControlsLive'
import WorkoutTimerDisplay from '../components/livetracking/WorkoutTimerDisplay'
import PanelButton from '../components/ui/PanelButton'
import { getWorkoutById } from '../api/workoutsApi'
import texture2 from '../assets/texture2.png'

export default function LiveTracking() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [restTimer, setRestTimer] = useState(0)
    const [isResting, setIsResting] = useState(false)
    const [restInterval, setRestInterval] = useState(null)

    const { 
        workout, 
        sets, 
        fetchWorkoutDetails, 
        startWorkout, 
        completeWorkout,
        toggleSetComplete,
        startTimer,
        stopTimer
    } = useWorkoutStore()

    const {
        timeElapsed,
        startWorkoutTimer,
        stopWorkoutTimer,
        startRestTimer,
        stopRestTimer,
        loadRestTimer,
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
            // Start workout if not already started
            if (!workoutData.start_time) {
                startWorkout(id)
            }
            // Start the workout timer
            startWorkoutTimer(id)
            // Load any existing rest timer
            loadRestTimer(id)
        }
    }, [workoutData, id, fetchWorkoutDetails, startWorkout, startWorkoutTimer, loadRestTimer])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (id) {
                cleanupTimers(id)
            }
        }
    }, [id, cleanupTimers])

    // Get next incomplete set
    const nextSet = sets?.find(set => !set.complete)
    
    // Calculate workout progress
    const completedSets = sets?.filter(set => set.complete).length || 0
    const totalSets = sets?.length || 0
    const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

    const handleStartRest = (duration) => {
        startRestTimer(duration, id)
    }

    const handleCompleteWorkout = async () => {
        try {
            await completeWorkout(id)
            stopWorkoutTimer()
            navigate('/workouts')
        } catch (error) {
            console.error('Error completing workout:', error)
        }
    }

    const handleBackToWorkouts = () => {
        if (window.confirm('Are you sure you want to leave? Your progress will be saved.')) {
            navigate('/workouts')
        }
    }

    if (error) {
        return (
            <main className="min-h-screen w-full relative overflow-hidden">
                {/* Background Texture */}
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none z-0"
                    style={{ 
                        backgroundImage: `url(${texture2})`,
                        backgroundSize: '500px 500px',
                        backgroundRepeat: 'repeat',
                        backgroundAttachment: 'scroll',
                        backgroundPosition: 'center center'
                    }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-black/80 to-black/90 z-10"></div>
                
                {/* Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-red-400 mb-4">Workout Not Found</h1>
                        <p className="text-gray-400 mb-6">The workout you&apos;re trying to track doesn&apos;t exist or has been deleted.</p>
                        <PanelButton 
                            onClick={() => navigate('/workouts')}
                            className="flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Workouts
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
                    className="absolute inset-0 opacity-40 pointer-events-none z-0"
                    style={{ 
                        backgroundImage: `url(${texture2})`,
                        backgroundSize: '500px 500px',
                        backgroundRepeat: 'repeat',
                        backgroundAttachment: 'scroll',
                        backgroundPosition: 'center center'
                    }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 z-10"></div>
                
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
                className="absolute inset-0 opacity-40 pointer-events-none z-0"
                style={{ 
                    backgroundImage: `url(${texture2})`,
                    backgroundSize: '500px 500px',
                    backgroundRepeat: 'repeat',
                    backgroundAttachment: 'scroll',
                    backgroundPosition: 'center center'
                }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 z-10"></div>
            
            {/* Content */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <PanelButton
                            onClick={handleBackToWorkouts}
                            className="flex items-center justify-center gap-2 bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-800/80"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Workouts</span>
                        </PanelButton>

                        {/* Workout Controls */}
                        <div className="flex gap-3">
                            {progress === 100 ? (
                                <PanelButton
                                    onClick={handleCompleteWorkout}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Complete Workout</span>
                                </PanelButton>
                            ) : (
                                <PanelButton
                                    onClick={handleCompleteWorkout}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Finish Early</span>
                                </PanelButton>
                            )}
                        </div>
                    </div>
                    
                    {/* Title and Progress */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6"
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold gains-font bg-gradient-to-r from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] mb-4">
                            {workout?.workout_name || 'Live Tracking'}
                        </h1>
                        
                        {/* Timer Display */}
                        <WorkoutTimerDisplay timeElapsed={timeElapsed} workout={workout} />
                        
                        {/* Progress Bar */}
                        <div className="max-w-md mx-auto mt-4">
                            <div className="flex justify-between text-sm text-gray-300 mb-2">
                                <span>Progress</span>
                                <span>{completedSets}/{totalSets} sets</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-gradient-to-r from-yellow-400 to-orange-600 h-3 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Main Tracking Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Current Set Tracking */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Current Set Timer */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <TimerLive nextSet={nextSet} />
                        </motion.div>

                        {/* Next Sets */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <SetTrackerLive showNextOnly={true} />
                        </motion.div>
                    </div>

                    {/* Middle Column - Workout Overview */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <WorkoutOverview />
                        </motion.div>
                    </div>

                    {/* Right Column - Completed Sets */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <SetTrackerLive showCompletedOnly={true} />
                        </motion.div>
                    </div>
                </div>

                {/* Workout Controls - Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                >
                    <WorkoutControlsLive />
                </motion.div>

                {/* Status Messages */}
                {nextSet && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed bottom-6 right-6 bg-gradient-to-r from-brand-dark-2/90 to-brand-dark/90 backdrop-blur-sm p-4 rounded-xl border border-brand-gold/40 shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-yellow-400" />
                            <div>
                                <p className="text-yellow-400 font-bold">Next Up:</p>
                                <p className="text-gray-300">{nextSet.exercise_name} - Set {nextSet.set_order}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    )
} 