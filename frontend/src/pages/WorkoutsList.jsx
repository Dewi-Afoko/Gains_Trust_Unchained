import React, { useState, useEffect, useMemo } from 'react'
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
    LucideActivity,
    Search,
    X
} from 'lucide-react'
import PanelButton from '../components/ui/PanelButton'
import WorkoutFeedFull from '../components/workouts/WorkoutFeedFull'
import WorkoutCreationForm from '../components/workouts/WorkoutCreationForm'
import texture2 from '../assets/texture2.png'

export default function WorkoutsList() {
    const [isCreatingWorkout, setIsCreatingWorkout] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    
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

    // Filter workouts based on search query
    const filteredWorkouts = useMemo(() => {
        if (!searchQuery.trim()) {
            return workouts
        }

        const query = searchQuery.toLowerCase().trim()
        
        return workouts.filter((workout) => {
            // Search in workout name
            const nameMatch = workout.workout_name?.toLowerCase().includes(query)
            
            // Search in notes
            const notesMatch = workout.notes?.toLowerCase().includes(query)
            
            // Search in date (formatted as displayed)
            const dateMatch = new Date(workout.date).toLocaleDateString().toLowerCase().includes(query)
            
            // Also search in raw date format (YYYY-MM-DD)
            const rawDateMatch = workout.date?.toLowerCase().includes(query)
            
            return nameMatch || notesMatch || dateMatch || rawDateMatch
        })
    }, [workouts, searchQuery])

    const clearSearch = () => {
        setSearchQuery('')
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

                {/* Filter Panel - now with search functionality */}
                {filterOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e] backdrop-blur-sm p-6 rounded-lg mb-6 border border-brand-gold/30 shadow-inner"
                    >
                        <div className="space-y-4">
                            {/* Search Input */}
                            <div>
                                <label className="block text-brand-gold font-semibold mb-2 text-sm uppercase tracking-wider">
                                    Search Workouts
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-brand-gold/60" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 bg-[#1a1a1a] border border-brand-gold/40 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all"
                                        placeholder="Search by workout name, date, or notes..."
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-gold/60 hover:text-brand-gold transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Search Results Info */}
                            {searchQuery && (
                                <div className="text-sm text-gray-300 bg-black/30 rounded-lg p-3 border border-brand-gold/20">
                                    {filteredWorkouts.length === 0 ? (
                                        <span className="text-yellow-400">
                                            No workouts found matching &ldquo;{searchQuery}&rdquo;
                                        </span>
                                    ) : (
                                        <span>
                                            Found <span className="text-brand-gold font-semibold">{filteredWorkouts.length}</span> 
                                            {' '}workout{filteredWorkouts.length !== 1 ? 's' : ''} matching 
                                            <span className="text-brand-gold font-semibold"> &ldquo;{searchQuery}&rdquo;</span>
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Search Tips */}
                            <div className="text-xs text-gray-400 bg-black/20 rounded-lg p-3 border border-brand-gold/10">
                                <div className="font-semibold text-brand-gold/70 mb-1 uppercase tracking-wider">Search Tips:</div>
                                <ul className="space-y-1">
                                    <li>• Search by workout name: &ldquo;Upper Body&rdquo;, &ldquo;Leg Day&rdquo;</li>
                                    <li>• Search by date: &ldquo;12/25/2023&rdquo;, &ldquo;December&rdquo;, &ldquo;2023&rdquo;</li>
                                    <li>• Search by notes: &ldquo;heavy&rdquo;, &ldquo;personal record&rdquo;, &ldquo;gym&rdquo;</li>
                                </ul>
                            </div>
                        </div>
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
                        workouts={filteredWorkouts}
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