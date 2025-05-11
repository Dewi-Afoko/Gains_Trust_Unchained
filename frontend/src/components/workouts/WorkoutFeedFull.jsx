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
    LucidePlus
} from 'lucide-react'
import PanelButton from '../ui/PanelButton'
import WorkoutCreationForm from './WorkoutCreationForm'

const WorkoutFeedFull = ({ workouts, onDelete, onDuplicate }) => {
    const navigate = useNavigate()
    const [isCreating, setIsCreating] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

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

    const formatDuration = (seconds) => {
        if (!seconds) return '0m'
        const minutes = Math.floor(seconds / 60)
        return `${minutes}m`
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-gold">Your Workouts</h2>
                <PanelButton
                    onClick={() => setIsCreating(true)}
                    className="w-auto"
                >
                    Create Workout
                </PanelButton>
            </div>

            {/* Workouts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workouts?.length > 0 ? (
                    workouts.map((workout) => (
                        <div
                            key={workout.id}
                            className="bg-brand-dark-2 rounded-xl border border-brand-gold/30 p-6 shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-brand-gold mb-4">
                                {workout.workout_name}
                            </h3>
                            
                            {/* Primary Workout Info */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <LucideCalendar className="w-4 h-4" />
                                    <span className="font-semibold">Date:</span>
                                    {new Date(workout.date).toLocaleDateString()}
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-300">
                                    <LucideActivity className="w-4 h-4" />
                                    <span className="font-semibold">Status:</span>
                                    {workout.complete ? (
                                        <span className="flex items-center gap-1 text-green-400">
                                            <LucideCheckCircle2 className="w-4 h-4" /> Complete
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-yellow-400">
                                            <LucideClock className="w-4 h-4" /> In Progress
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-gray-300">
                                    <LucideDumbbell className="w-4 h-4" />
                                    <span className="font-semibold">Exercises:</span>
                                    {workout.exercise_count || 0}
                                </div>

                                {workout.description && (
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <LucideClipboardList className="w-4 h-4" />
                                        <span className="font-semibold">Description:</span>
                                        <p className="text-sm line-clamp-2">{workout.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Workout Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-3 bg-zinc-800 rounded-lg">
                                    <p className="text-yellow-500 text-lg font-semibold">
                                        {workout.total_sets || 0}
                                    </p>
                                    <p className="text-xs text-gray-400">Total Sets</p>
                                </div>
                                <div className="text-center p-3 bg-zinc-800 rounded-lg">
                                    <p className="text-yellow-500 text-lg font-semibold">
                                        {workout.completion_count || 0}
                                    </p>
                                    <p className="text-xs text-gray-400">Completions</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <PanelButton
                                    onClick={() => navigate(`/workouts/${workout.id}`)}
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <LucideEye className="w-4 h-4" />
                                    View
                                </PanelButton>
                                <PanelButton
                                    onClick={() => handleDuplicate(workout.id)}
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <LucideCopy className="w-4 h-4" />
                                    Copy
                                </PanelButton>
                                <PanelButton
                                    onClick={() => handleDelete(workout.id)}
                                    variant="danger"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <LucideTrash2 className="w-4 h-4" />
                                    Delete
                                </PanelButton>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-400 text-lg mb-4">No workouts yet</p>
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
