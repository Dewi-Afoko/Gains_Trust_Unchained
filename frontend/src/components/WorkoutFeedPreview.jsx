import { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/AuthContext'

const WorkoutFeed = ({ setWorkoutId }) => {
    const { accessToken } = useContext(AuthContext)
    const [workouts, setWorkouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/workouts/`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch workouts')
                }

                const data = await response.json()
                setWorkouts(data.workouts)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchWorkouts()
    }, [accessToken])

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
                            onClick={() => setWorkoutId(workout.id)} // Clicking sets the workoutId
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
