import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useWorkoutStore from '../stores/workoutStore'
import { 
    LucideListFilter, 
    LucidePlus,
    LucideCheckCircle2,
    LucideClock,
    LucideDumbbell,
    LucideClipboardList,
    LucideCalendar,
    LucideActivity
} from 'lucide-react'
import PanelButton from '../components/ui/PanelButton'
import WorkoutFeedFull from '../components/workouts/WorkoutFeedFull'
import WorkoutCreationForm from '../components/workouts/WorkoutCreationForm'

export default function WorkoutsList() {
    const [isCreatingWorkout, setIsCreatingWorkout] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    
    const { 
        workouts, 
        loading, 
        error, 
        fetchAllWorkouts,
        deleteWorkout,
        duplicateWorkout 
    } = useWorkoutStore()

    useEffect(() => {
        fetchAllWorkouts()
    }, []) // Remove fetchAllWorkouts from deps since it's stable from the store

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold gains-font bg-gradient-to-r from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text"
                    >
                        Your Workouts
                    </motion.h1>
                    
                    <div className="flex gap-4">
                        {/* Filter Button */}
                        <button 
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="bg-zinc-900 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <LucideListFilter className="w-5 h-5" />
                        </button>

                        {/* Create Workout Button */}
                        <PanelButton 
                            onClick={() => setIsCreatingWorkout(true)}
                            className="flex items-center gap-2"
                        >
                            <LucidePlus className="w-5 h-5" />
                            New Workout
                        </PanelButton>
                    </div>
                </div>

                {/* Filter Panel - can be expanded later */}
                {filterOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 p-4 rounded-lg mb-6"
                    >
                        {/* Add filter controls here */}
                        <p className="text-gray-400">Filters coming soon...</p>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-red-500 text-center p-4 bg-red-900/20 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Workouts Feed */}
                {!loading && !error && (
                    <WorkoutFeedFull 
                        workouts={workouts}
                        onDelete={deleteWorkout}
                        onDuplicate={duplicateWorkout}
                    />
                )}
            </div>

            {/* Creation Form Modal */}
            {isCreatingWorkout && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2 p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4">
                        <WorkoutCreationForm 
                            onClose={() => setIsCreatingWorkout(false)}
                            setIsCreating={setIsCreatingWorkout}
                        />
                    </div>
                </div>
            )}
        </main>
    )
} 