import { useEffect } from 'react'
import useWorkoutStore from '../../stores/workoutStore'
import PanelHeader from '../ui/PanelHeader'
import { Dumbbell, Calendar, Timer } from 'lucide-react'

const WorkoutItem = ({ workout, onClick }) => {
    const duration = workout.duration 
        ? new Date(workout.duration * 1000).toISOString().substr(11, 8)
        : 'In Progress'

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

    useEffect(() => {
        fetchAllWorkouts()
    }, [])

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
                        {workouts.map((workout) => (
                            <WorkoutItem
                                key={workout.id}
                                workout={workout}
                                onClick={() => setWorkoutId(workout.id)}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-brand-gold/70 uppercase tracking-wider font-medium">No workouts found.</p>
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
        </div>
    )
}

export default WorkoutFeedPreview
