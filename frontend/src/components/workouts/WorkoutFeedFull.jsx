import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    LucideCheckCircle2, 
    LucideClock, 
    LucideDumbbell,
    LucideClipboardList,
    LucideCalendar,
    LucideActivity,
    LucideEye,
    LucideCopy,
    LucideTrash2,
    LucidePlus,
    LucidePlay
} from 'lucide-react'
import PanelButton from '../ui/PanelButton'
import WorkoutCreationForm from './WorkoutCreationForm'
import useWorkoutStore from '../../stores/workoutStore'

const WorkoutFeedFull = ({ workouts, onDelete, onDuplicate }) => {
    const navigate = useNavigate()
    const [isCreating, setIsCreating] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    
    // Get exercise counts and sets data from store
    const { getExerciseCounts, getSetsByWorkoutId, toggleComplete } = useWorkoutStore()

    const handleDuplicate = async (workoutId) => {
        try {
            const newWorkout = await onDuplicate(workoutId)
            if (newWorkout?.id) {
                navigate(`/workouts/${newWorkout.id}`)
            }
        } catch (error) {
            console.error('Error duplicating workout:', error)
        }
    }

    const handleDelete = async (workoutId) => {
        if (window.confirm('Are you sure you want to delete this workout?')) {
            try {
                await onDelete(workoutId)
            } catch (error) {
                console.error('Error deleting workout:', error)
            }
        }
    }

    const handleMarkComplete = async (workoutId) => {
        try {
            await toggleComplete(workoutId)
        } catch (error) {
            console.error('Error marking workout complete:', error)
        }
    }

    const formatDuration = (seconds) => {
        if (!seconds) return '0m'
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`
        }
    }

    const getWorkoutStatus = (workout) => {
        if (!workout.start_time) {
            return {
                text: 'Not Started',
                icon: <LucideClock className="w-4 h-4" />,
                color: 'text-gray-400'
            }
        } else if (workout.duration) {
            return {
                text: `Completed in ${formatDuration(workout.duration)}`,
                icon: <LucideCheckCircle2 className="w-4 h-4" />,
                color: 'text-green-400'
            }
        } else {
            return {
                text: 'In Progress',
                icon: <LucideActivity className="w-4 h-4" />,
                color: 'text-yellow-400'
            }
        }
    }

    return (
        <div className="container mx-auto p-4">
            {/* Workouts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workouts?.length > 0 ? (
                    workouts.map((workout) => {
                        const exerciseCounts = getExerciseCounts(workout.id)
                        const sets = getSetsByWorkoutId(workout.id)
                        const totalSets = sets.length
                        const status = getWorkoutStatus(workout)

                        return (
                            <div
                                key={workout.id}
                                className="bg-brand-dark-2 rounded-xl border border-brand-gold/30 p-6 shadow-lg"
                            >
                                <h3 
                                    className="text-xl font-bold text-brand-gold mb-4 cursor-pointer hover:text-yellow-300 transition"
                                    onClick={() => navigate(`/workouts/${workout.id}`)}
                                >
                                    🏋🏾‍♂️ {workout.workout_name}
                                </h3>
                                
                                {/* Primary Workout Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <LucideCalendar className="w-4 h-4" />
                                        📅 {new Date(workout.date).toLocaleDateString()}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <LucideClipboardList className="w-4 h-4" />
                                        📝 {workout.notes || 'No notes'}
                                    </div>

                                    {/* Exercise List with Counts */}
                                    <div className="text-gray-300">
                                        <p className="text-brand-gold font-semibold mb-1">💪🏾 Exercises:</p>
                                        {Object.keys(exerciseCounts).length > 0 ? (
                                            <ul className="text-brand-gold ml-4 space-y-1">
                                                {Object.entries(exerciseCounts).map(([exercise, count]) => (
                                                    <li key={exercise} className="text-sm">
                                                        {count}x {exercise}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 ml-4 text-sm">No exercises yet</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-300">
                                        <LucideDumbbell className="w-4 h-4" />
                                        🔥 Total Sets: <span className="text-brand-gold font-semibold">{totalSets}</span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mb-6">
                                    <p className={`text-xl font-bold flex items-center gap-2 ${status.color}`}>
                                        Status: {status.icon} {status.text}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    {/* Top row - Start Live Tracking (primary action) */}
                                    <PanelButton
                                        onClick={() => navigate(`/livetracking/${workout.id}`)}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
                                    >
                                        <LucidePlay className="w-4 h-4" />
                                        🚀 Start Live Tracking
                                    </PanelButton>

                                    {/* Second row - Mark Complete (only if in progress) */}
                                    {workout.start_time && !workout.duration && (
                                        <PanelButton
                                            onClick={() => handleMarkComplete(workout.id)}
                                            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600"
                                        >
                                            <LucideCheckCircle2 className="w-4 h-4" />
                                            🏁 Mark Complete
                                        </PanelButton>
                                    )}

                                    {/* Bottom row - Secondary actions */}
                                    <div className="flex gap-2">
                                        <PanelButton
                                            onClick={() => navigate(`/workouts/${workout.id}`)}
                                            className="flex-1 flex items-center justify-center gap-1 text-sm"
                                        >
                                            <LucideEye className="w-4 h-4" />
                                            View
                                        </PanelButton>
                                        <PanelButton
                                            onClick={() => handleDuplicate(workout.id)}
                                            className="flex-1 flex items-center justify-center gap-1 text-sm"
                                        >
                                            <LucideCopy className="w-4 h-4" />
                                            📝 Copy
                                        </PanelButton>
                                        <PanelButton
                                            onClick={() => handleDelete(workout.id)}
                                            variant="danger"
                                            className="flex-1 flex items-center justify-center gap-1 text-sm"
                                        >
                                            <LucideTrash2 className="w-4 h-4" />
                                            💀 Delete
                                        </PanelButton>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-400 text-lg mb-4">No workouts found.</p>
                        <PanelButton 
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2"
                        >
                            <LucidePlus className="w-5 h-5" />
                            Create Your First Workout
                        </PanelButton>
                    </div>
                )}
            </div>

            {/* Create Workout Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2 p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4">
                        <WorkoutCreationForm
                            onClose={() => {
                                setIsCreating(false)
                                setIsSubmitted(false)
                            }}
                            setIsCreating={setIsCreating}
                            setIsSubmitted={setIsSubmitted}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkoutFeedFull
