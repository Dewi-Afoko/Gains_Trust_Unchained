import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Play,
    Edit,
    Calendar,
    Clock,
    FileText,
    Activity,
    CheckCircle2,
} from 'lucide-react'
import WorkoutDetailsFull from '../components/workouts/WorkoutDetailsFull'
import PanelButton from '../components/ui/PanelButton'
import useWorkoutStore from '../stores/workoutStore'
import { getWorkoutById } from '../api/workoutsApi'
import texture2 from '../assets/texture2.png'

export default function WorkoutDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { fetchWorkoutDetails } = useWorkoutStore()

    // Use React Query for the workout data
    const {
        data: workout,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['workout', id],
        queryFn: () => getWorkoutById(id),
        enabled: !!id,
    })

    // Update Zustand store when workout data changes
    useEffect(() => {
        if (workout && id) {
            fetchWorkoutDetails(id)
        }
    }, [workout, id, fetchWorkoutDetails])

    // Helper function to determine workout status
    const getWorkoutStatus = (workout) => {
        if (!workout)
            return { text: 'N/A', icon: Clock, color: 'text-gray-400' }
        if (workout.duration) {
            const hours = Math.floor(workout.duration / 3600)
            const minutes = Math.floor((workout.duration % 3600) / 60)
            const seconds = workout.duration % 60
            let timeStr = ''
            if (hours > 0) {
                timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            } else {
                timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
            }
            return {
                text: `Completed in ${timeStr}`,
                icon: CheckCircle2,
                color: 'text-green-400',
            }
        }
        if (workout.start_time) {
            return {
                text: 'In Progress',
                icon: Activity,
                color: 'text-yellow-400',
            }
        }
        return {
            text: 'Not Started',
            icon: Clock,
            color: 'text-gray-400',
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
                        backgroundPosition: 'center center',
                    }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 z-10"></div>

                {/* Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center py-12">
                        <h1 className="text-3xl font-bold text-red-400 mb-4">
                            Workout Not Found
                        </h1>
                        <p className="text-gray-400 mb-6">
                            The workout you&apos;re looking for doesn&apos;t
                            exist or has been deleted.
                        </p>
                        <PanelButton
                            onClick={() => navigate('/workouts')}
                            className="flex items-center justify-center gap-2"
                        >
                            Back to Workouts
                        </PanelButton>
                    </div>
                </div>
            </main>
        )
    }

    const status = getWorkoutStatus(workout)
    const StatusIcon = status.icon

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
                    backgroundPosition: 'center center',
                }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 z-10"></div>

            {/* Content */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 py-12 pb-24">
                {/* Header Section */}
                <div className="mb-8">
                    {/* Navigation */}
                    <div className="flex items-center gap-4 mb-6">
                        <PanelButton
                            onClick={() => navigate('/workouts')}
                            className="flex items-center justify-center gap-2 bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-800/80"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Workouts</span>
                        </PanelButton>
                    </div>

                    {/* Title and Quick Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl lg:text-5xl font-bold gains-font bg-gradient-to-r from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]"
                        >
                            {workout?.workout_name || 'Loading...'}
                        </motion.h1>

                        {/* Quick Actions - Only Live Tracking */}
                        {workout && (
                            <div className="flex justify-center lg:justify-end gap-3 mb-8">
                                <PanelButton
                                    onClick={() =>
                                        navigate(`/livetracking/${id}`)
                                    }
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-center"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>Live Tracking</span>
                                </PanelButton>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Workout Details Component */}
                {!isLoading && workout && (
                    <div className="relative overflow-hidden bg-gradient-to-b from-brand-dark-2/90 via-brand-dark/80 to-brand-dark-2/90 backdrop-blur-sm rounded-xl border border-brand-gold/40 p-6 shadow-2xl">
                        {/* Component texture */}
                        <div
                            className="absolute inset-0 opacity-20 pointer-events-none rounded-xl"
                            style={{
                                backgroundImage: `url(${texture2})`,
                                backgroundSize: '400px 400px',
                                backgroundRepeat: 'repeat',
                            }}
                        />
                        <div className="relative z-10">
                            <WorkoutDetailsFull />
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
