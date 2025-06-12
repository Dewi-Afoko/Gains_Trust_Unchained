import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    CheckCircle2, 
    Clock, 
    Dumbbell,
    ClipboardList,
    Calendar,
    Activity,
    Eye,
    Copy,
    Trash2,
    Plus,
    Play,
    FileText
} from 'lucide-react'
import PanelButton from '../ui/PanelButton'
import WorkoutCreationForm from './WorkoutCreationForm'
import useWorkoutStore from '../../stores/workoutStore'
import texture2 from '../../assets/texture2.png'

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
                icon: Clock,
                color: 'text-gray-400'
            }
        } else if (workout.duration) {
            return {
                text: `Completed in ${formatDuration(workout.duration)}`,
                icon: CheckCircle2,
                color: 'text-green-400'
            }
        } else {
            return {
                text: 'In Progress',
                icon: Activity,
                color: 'text-yellow-400'
            }
        }
    }

    if (!workouts || workouts.length === 0) {
        return (
            <div className="w-full relative min-h-[400px] overflow-hidden rounded-xl border border-brand-gold/30">
                {/* Background Texture */}
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none z-0 rounded-xl"
                    style={{ 
                        backgroundImage: `url(${texture2})`,
                        backgroundSize: '500px 500px',
                        backgroundRepeat: 'repeat',
                        backgroundAttachment: 'scroll',
                        backgroundPosition: 'center center'
                    }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 rounded-xl z-10"></div>
                
                {/* Content */}
                <div className="relative z-20 text-center py-12 text-gray-400 flex flex-col items-center justify-center h-full">
                    <Dumbbell className="w-16 h-16 mx-auto mb-4 text-brand-gold/60" />
                    <p className="text-xl mb-2 font-bold uppercase tracking-wider">No workouts yet</p>
                    <p className="font-medium">Create your first workout to get started!</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Workouts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workouts.map((workout) => {
                    const exerciseCounts = getExerciseCounts(workout.id)
                    const sets = getSetsByWorkoutId(workout.id)
                    const totalSets = sets.length
                    const status = getWorkoutStatus(workout)
                    const StatusIcon = status.icon

                    return (
                        <div
                            key={workout.id}
                            className="relative overflow-hidden bg-gradient-to-b from-brand-dark-2/90 via-brand-dark/80 to-brand-dark-2/90 backdrop-blur-sm rounded-xl border border-brand-gold/40 p-6 shadow-2xl hover:border-brand-gold/60 transition-all duration-300 hover:shadow-brand-gold/20 hover:transform hover:scale-[1.02] group"
                        >
                            {/* Background Texture for individual cards */}
                            <div
                                className="absolute inset-0 opacity-20 pointer-events-none z-0 rounded-xl group-hover:opacity-30 transition-opacity duration-300"
                                style={{ 
                                    backgroundImage: `url(${texture2})`,
                                    backgroundSize: '300px 300px',
                                    backgroundRepeat: 'repeat',
                                    backgroundAttachment: 'scroll',
                                    backgroundPosition: 'center center'
                                }}
                            />
                            {/* Card overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 via-black/60 to-black/80 rounded-xl z-10 group-hover:from-yellow-900/15 group-hover:via-black/50 group-hover:to-black/75 transition-all duration-300"></div>
                            
                            {/* Card content */}
                            <div className="relative z-20">
                                {/* Workout Title */}
                                <h3 
                                    className="text-xl font-bold text-brand-gold mb-4 cursor-pointer hover:text-yellow-300 transition flex items-center gap-3 group-hover:text-yellow-200"
                                    onClick={() => navigate(`/workouts/${workout.id}`)}
                                >
                                    <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1.5 shadow-lg group-hover:shadow-xl transition-shadow">
                                        <Dumbbell className="w-4 h-4 stroke-[2.5px] text-black" />
                                    </div>
                                    {workout.workout_name}
                                </h3>
                                
                                {/* Primary Workout Info */}
                                <div className="space-y-3 mb-6">
                                    {/* Date */}
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1 shadow-lg">
                                            <Calendar className="w-3 h-3 stroke-[2.5px] text-black" />
                                        </div>
                                        <span className="font-medium">{new Date(workout.date).toLocaleDateString()}</span>
                                    </div>
                                    
                                    {/* Notes */}
                                    {workout.notes && (
                                        <div className="flex items-start gap-3 text-gray-300">
                                            <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1 shadow-lg">
                                                <FileText className="w-3 h-3 stroke-[2.5px] text-black" />
                                            </div>
                                            <span className="text-sm font-medium">{workout.notes}</span>
                                        </div>
                                    )}

                                    {/* Exercise List with Counts */}
                                    <div className="text-gray-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1 shadow-lg">
                                                <ClipboardList className="w-3 h-3 stroke-[2.5px] text-black" />
                                            </div>
                                            <span className="text-brand-gold font-bold uppercase tracking-wider text-sm">Exercises:</span>
                                        </div>
                                        {Object.keys(exerciseCounts).length > 0 ? (
                                            <ul className="text-brand-gold ml-6 space-y-1">
                                                {Object.entries(exerciseCounts).map(([exercise, count]) => (
                                                    <li key={exercise} className="text-sm font-medium">
                                                        {count}x {exercise}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 ml-6 text-sm font-medium">No exercises yet</p>
                                        )}
                                    </div>

                                    {/* Total Sets */}
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1 shadow-lg">
                                            <Dumbbell className="w-3 h-3 stroke-[2.5px] text-black" />
                                        </div>
                                        <span className="font-medium">Total Sets: <span className="text-brand-gold font-bold">{totalSets}</span></span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mb-6 p-4 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-sm rounded-lg border border-brand-gold/30 shadow-inner">
                                    <div className={`flex items-center gap-3 ${status.color}`}>
                                        <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1.5 shadow-lg">
                                            <StatusIcon className="w-4 h-4 stroke-[2.5px] text-black" />
                                        </div>
                                        <span className="font-bold uppercase tracking-wider">Status: {status.text}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    {/* Conditional Primary Action */}
                                    {!workout.duration ? (
                                        /* Show Live Tracking for incomplete workouts */
                                        <PanelButton
                                            onClick={() => navigate(`/livetracking/${workout.id}`)}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-center"
                                        >
                                            <Play className="w-4 h-4" />
                                            <span>Start Live Tracking</span>
                                        </PanelButton>
                                    ) : (
                                        /* Show completion status for completed workouts */
                                        <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-700 to-green-600 px-4 py-3 rounded border border-green-500/50">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                            <span className="text-white font-bold uppercase tracking-wider text-sm">
                                                Completed in {formatDuration(workout.duration)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Secondary actions */}
                                    <div className="flex gap-2">
                                        <PanelButton
                                            onClick={() => navigate(`/workouts/${workout.id}`)}
                                            className="flex-1 flex items-center justify-center gap-1 text-sm bg-zinc-700 hover:bg-zinc-600 text-center"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View</span>
                                        </PanelButton>
                                        <PanelButton
                                            onClick={() => handleDuplicate(workout.id)}
                                            className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-700 hover:bg-blue-600 text-center"
                                        >
                                            <Copy className="w-4 h-4" />
                                            <span>Copy</span>
                                        </PanelButton>
                                        <PanelButton
                                            onClick={() => handleDelete(workout.id)}
                                            className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-700 hover:bg-red-600 text-center"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </PanelButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Creation Form Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4 shadow-lg">
                        <WorkoutCreationForm 
                            onClose={() => setIsCreating(false)}
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
