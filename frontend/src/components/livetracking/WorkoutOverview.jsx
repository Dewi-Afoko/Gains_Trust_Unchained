import { useState } from 'react'
import useWorkoutStore from '../../stores/workoutStore'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'

const WorkoutOverview = () => {
    const { workout, sets } = useWorkoutStore()
    const [isExpanded, setIsExpanded] = useState(true)

    // Calculate exercise stats
    const exerciseStats = sets.reduce((acc, set) => {
        if (!acc[set.exercise_name]) {
            acc[set.exercise_name] = {
                totalSets: 0,
                completedSets: 0,
                totalReps: 0,
                totalWeight: 0,
            }
        }

        acc[set.exercise_name].totalSets++
        if (set.complete) acc[set.exercise_name].completedSets++
        if (set.reps) acc[set.exercise_name].totalReps += set.reps
        if (set.loading) acc[set.exercise_name].totalWeight += set.loading

        return acc
    }, {})

    return (
        <div className="bg-[#500000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg">
            <h3
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-yellow-400 text-2xl font-extrabold text-stroke mb-3 cursor-pointer hover:text-yellow-300 transition"
            >
                📊 Workout Overview {isExpanded ? '🔽' : '▶️'}
            </h3>

            <div
                className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                {/* Workout Info */}
                <div className="mb-4">
                    <h4 className="text-lg font-bold text-yellow-300 mb-2">
                        {workout?.workout_name}
                    </h4>
                    <p className="text-gray-300">
                        Date: {new Date(workout?.date).toLocaleDateString()}
                    </p>
                    {workout?.notes && (
                        <p className="text-gray-300">Notes: {workout.notes}</p>
                    )}
                </div>

                {/* Exercise Stats */}
                <div className="space-y-4">
                    {Object.entries(exerciseStats).map(([exercise, stats]) => (
                        <div
                            key={exercise}
                            className="bg-[#600000] p-3 rounded-lg border border-yellow-400"
                        >
                            <h5 className="text-yellow-300 font-bold mb-2">
                                {exercise}
                            </h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p>
                                    Sets: {stats.completedSets}/
                                    {stats.totalSets}
                                </p>
                                <p>Total Reps: {stats.totalReps}</p>
                                <p>
                                    Total Weight:{' '}
                                    {formatLoading(stats.totalWeight)}
                                </p>
                                <p>
                                    Progress:{' '}
                                    {Math.round(
                                        (stats.completedSets /
                                            stats.totalSets) *
                                            100
                                    )}
                                    %
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Overall Progress */}
                <div className="mt-4">
                    <h4 className="text-lg font-bold text-yellow-300 mb-2">
                        Overall Progress
                    </h4>
                    <div className="bg-[#600000] p-3 rounded-lg border border-yellow-400">
                        <p>
                            Total Sets Completed:{' '}
                            {sets.filter((s) => s.complete).length}/
                            {sets.length}
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                            <div
                                className="bg-yellow-400 h-2.5 rounded-full"
                                style={{
                                    width: `${Math.round(
                                        (sets.filter((s) => s.complete).length /
                                            sets.length) *
                                            100
                                    )}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WorkoutOverview
