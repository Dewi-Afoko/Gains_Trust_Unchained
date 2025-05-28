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
import texture2 from '../assets/texture2.png'

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
                <div className="flex justify-between items-center mb-8">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold gains-font bg-gradient-to-r from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]"
                    >
                        Your Workouts
                    </motion.h1>
                    
                    <div className="flex gap-4">
                        {/* Filter Button */}
                        <button 
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e] backdrop-blur-sm p-3 rounded-lg hover:from-brand-red/90 hover:via-brand-red/80 hover:to-brand-red-dark/90 transition-all duration-200 flex items-center justify-center border border-brand-gold/80 hover:border-brand-red shadow-inner"
                        >
                            <LucideListFilter className="w-5 h-5 text-brand-gold" />
                        </button>

                        {/* Create Workout Button */}
                        <PanelButton 
                            onClick={() => setIsCreatingWorkout(true)}
                            className="flex items-center justify-center gap-2 text-center"
                        >
                            <LucidePlus className="w-5 h-5" />
                            <span>New Workout</span>
                        </PanelButton>
                    </div>
                </div>

                {/* Filter Panel - can be expanded later */}
                {filterOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e] backdrop-blur-sm p-4 rounded-lg mb-6 border border-brand-gold/30 shadow-inner"
                    >
                        {/* Add filter controls here */}
                        <p className="text-gray-400">Filters coming soon...</p>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-red-400 text-center p-4 bg-gradient-to-b from-red-900/60 via-red-800/80 to-red-900/90 rounded-lg border border-red-500/50 backdrop-blur-sm shadow-inner">
                        <span className="font-bold uppercase tracking-wider">{error}</span>
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
                    <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4 shadow-lg">
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