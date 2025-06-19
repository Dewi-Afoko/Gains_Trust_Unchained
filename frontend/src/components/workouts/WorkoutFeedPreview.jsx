import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useWorkoutStore from '../../stores/workoutStore'
import PanelHeader from '../ui/PanelHeader'
import PanelButton from '../ui/PanelButton'
import WorkoutCreationForm from './WorkoutCreationForm'
import { Dumbbell, Calendar, Timer, Plus } from 'lucide-react'

const WorkoutItem = ({ workout, onClick }) => {
    const getWorkoutStatus = () => {
        if (workout.duration) {
            // Workout is completed - show duration
            return new Date(workout.duration * 1000).toISOString().substr(11, 8)
        } else if (workout.start_time) {
            // Workout has been started but not completed
            return 'In Progress'
        } else {
            // Workout hasn't been started yet
            return 'Not Started'
        }
    }
    
    const duration = getWorkoutStatus()

    return (
        <li
            className="bg-black/30 p-4 rounded-lg cursor-pointer hover:bg-black/50 transition-all border border-brand-gold/30 hover:border-brand-gold/50 mb-3 group relative transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={onClick}
        >
            {/* Content */}
            <div className="flex items-center">
                <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-2 mr-3 group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-5 h-5 text-black stroke-[2.5px]" />
                </div>
                <div className="flex-1">
                    <div className="font-bold justify-center align-middle text-brand-gold group-hover:text-brand-gold/80 transition-colors tracking-wider">
                        {workout.workout_name}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 font-medium mt-1">
                        <span className="flex items-center uppercase tracking-wide">
                            <Calendar className="w-4 h-4 mr-1 group-hover:text-brand-gold transition-colors" />
                            {new Date(workout.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center uppercase tracking-wide">
                            <Timer className="w-4 h-4 mr-1 group-hover:text-brand-gold transition-colors" />
                            {duration}
                        </span>
                    </div>
                </div>
            </div>

            {/* Corner Rivets with Hover Effect */}
            <div className="absolute left-1 top-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70 group-hover:bg-brand-gold group-hover:opacity-100 transition-all" />
            <div className="absolute right-1 top-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70 group-hover:bg-brand-gold group-hover:opacity-100 transition-all" />
            <div className="absolute left-1 bottom-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70 group-hover:bg-brand-gold group-hover:opacity-100 transition-all" />
            <div className="absolute right-1 bottom-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70 group-hover:bg-brand-gold group-hover:opacity-100 transition-all" />
        </li>
    )
}

const WorkoutFeedPreview = ({ setWorkoutId, maxHeight = '320px' }) => {
    const { workouts, loading, error, fetchAllWorkouts } = useWorkoutStore()
    const navigate = useNavigate()
    const [showCreateForm, setShowCreateForm] = useState(false)

    useEffect(() => {
        fetchAllWorkouts()
    }, [])

    const handleWorkoutCreated = () => {
        setShowCreateForm(false)
        fetchAllWorkouts() // Refresh the workouts list
    }

    return (
        <div className="flex flex-col h-full w-full">
            <PanelHeader title="Your Workouts" icon={Dumbbell} />
            <div
                className="space-y-3 pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent hover:scrollbar-thumb-brand-gold/40 animate-fadeIn"
                style={{ minHeight: 180, maxHeight }}
            >
                {loading && workouts.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : workouts.length > 0 ? (
                    <ul>
                        {/* Create Workout Button */}
                        <li className="mb-3">
                            <PanelButton
                                onClick={() => setShowCreateForm(true)}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 py-3"
                            >
                                <Plus className="w-5 h-5" />
                                Create New Workout
                            </PanelButton>
                        </li>
                        {workouts.map((workout) => (
                            <WorkoutItem
                                key={workout.id}
                                workout={workout}
                                onClick={() => setWorkoutId(workout.id)}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <p className="text-brand-gold/70 uppercase tracking-wider font-medium">
                            No workouts found.
                        </p>
                        <PanelButton
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
                        >
                            <Plus className="w-4 h-4" />
                            Create Your First Workout
                        </PanelButton>
                    </div>
                )}
                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 text-center">
                        <p className="text-red-400 font-medium">{error}</p>
                    </div>
                )}
                {loading && workouts.length > 0 && (
                    <div className="text-center py-2">
                        <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                )}
                {workouts.length > 0 && (
                    <p className="text-brand-gold/40 text-center text-sm border-t border-brand-gold/20 pt-2 uppercase tracking-wider">
                        All Workouts Loaded
                    </p>
                )}
            </div>

            {/* Workout Creation Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-dark-2 rounded-xl border border-brand-gold max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <WorkoutCreationForm 
                            onClose={handleWorkoutCreated}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkoutFeedPreview
