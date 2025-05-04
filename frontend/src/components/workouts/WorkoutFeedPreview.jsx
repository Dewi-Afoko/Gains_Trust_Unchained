import { useWorkoutContext } from '../../providers/WorkoutContext'

const WorkoutFeed = ({ setWorkoutId }) => {
    const { workouts, loading, error } = useWorkoutContext()

    if (loading) return <p className="text-white">Loading workouts...</p>
    if (error) return <p className="text-red-500">Error: {error}</p>

    return (
        <div className="w-full max-w-2xl bg-[#600000] border border-yellow-400 shadow-lg p-6 text-white rounded-lg">
            <h2 className="text-xl font-bold text-yellow-400">Workout Feed</h2>
            {workouts?.length > 0 ? (
                <ul className="mt-4 space-y-3">
                    {workouts.map((workout) => (
                        <li
                            key={workout.id}
                            className="bg-[#400000] p-3 rounded-lg cursor-pointer hover:bg-[#500000] transition"
                            onClick={() => setWorkoutId(workout.id)}
                        >
                            <strong>{workout.workout_name}</strong> -{' '}
                            {new Date(workout.date).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No workouts found.</p>
            )}
        </div>
    )
}

export default WorkoutFeed
