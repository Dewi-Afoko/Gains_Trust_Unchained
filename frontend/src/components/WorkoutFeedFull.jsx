import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AuthContext from '../context/AuthContext'

const WorkoutFeedFull = () => {
    const { accessToken } = useContext(AuthContext)
    const [workouts, setWorkouts] = useState([])
    const [workoutSets, setWorkoutSets] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        fetchWorkouts()
    }, [accessToken])

    const fetchWorkouts = async () => {
        try {
            console.log('📡 Fetching workouts...')
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            const fetchedWorkouts = response.data.workouts || []
            setWorkouts(fetchedWorkouts)

            fetchedWorkouts.forEach((workout) => fetchWorkoutSets(workout.id))
        } catch (error) {
            console.error('❌ Error fetching workouts:', error)
            setWorkouts([])
        }
    }

    const fetchWorkoutSets = async (workoutId) => {
        try {
            console.log(`📡 Fetching sets for workout ${workoutId}...`)
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            setWorkoutSets((prev) => ({
                ...prev,
                [workoutId]: response.data.sets || [],
            }))
        } catch (error) {
            console.error(
                `❌ Error fetching sets for workout ${workoutId}:`,
                error
            )
        }
    }

    const toggleComplete = async (workoutId, currentState) => {
        try {
            console.log(
                `📡 Toggling complete status for workout ${workoutId}...`
            )
            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                { complete: !currentState },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            console.log('✅ Workout completion updated:', response.data)

            setWorkouts((prev) =>
                prev.map((w) =>
                    w.id === workoutId ? { ...w, complete: !currentState } : w
                )
            )
        } catch (error) {
            console.error('❌ Error updating workout:', error)
        }
    }

    // ✅ Delete Workout
    const deleteWorkout = async (workoutId) => {
        try {
            console.log(`🗑 Deleting workout ${workoutId}...`)
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            console.log('✅ Workout deleted successfully')
            setWorkouts((prev) => prev.filter((w) => w.id !== workoutId))
        } catch (error) {
            console.error('❌ Error deleting workout:', error)
        }
    }

    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full border-collapse border border-yellow-400">
                <thead>
                    <tr className="bg-[#500000] text-yellow-400">
                        <th className="border border-yellow-400 p-2">
                            Workout Name
                        </th>
                        <th className="border border-yellow-400 p-2">Date</th>
                        <th className="border border-yellow-400 p-2">Notes</th>
                        <th className="border border-yellow-400 p-2">
                            Exercises
                        </th>
                        <th className="border border-yellow-400 p-2">
                            Complete
                        </th>
                        <th className="border border-yellow-400 p-2">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {workouts.length > 0 ? (
                        workouts.map((workout) => {
                            const sets = workoutSets[workout.id] || []
                            const uniqueExercises = [
                                ...new Set(
                                    sets.map((set) => set.exercise_name)
                                ),
                            ].join(', ')

                            return (
                                <tr key={workout.id} className="text-white">
                                    <td
                                        className="border border-yellow-400 p-2 cursor-pointer text-yellow-300 hover:text-yellow-200"
                                        onClick={() =>
                                            navigate(
                                                `/workouts/${workout.id}/full`
                                            )
                                        }
                                    >
                                        {workout.workout_name}
                                    </td>
                                    <td className="border border-yellow-400 p-2">
                                        {new Date(
                                            workout.date
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="border border-yellow-400 p-2">
                                        {workout.notes || 'N/A'}
                                    </td>
                                    <td className="border border-yellow-400 p-2">
                                        {uniqueExercises || 'No Exercises'}
                                    </td>
                                    <td className="border border-yellow-400 p-2 text-center">
                                        <button
                                            onClick={() =>
                                                toggleComplete(
                                                    workout.id,
                                                    workout.complete
                                                )
                                            }
                                            className={`px-3 py-1 rounded ${
                                                workout.complete
                                                    ? 'bg-green-500 hover:bg-green-400'
                                                    : 'bg-red-500 hover:bg-red-400'
                                            } transition text-black`}
                                        >
                                            {workout.complete ? '✅' : '❌'}
                                        </button>
                                    </td>
                                    <td className="border border-yellow-400 p-2 space-x-2">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/livetracking/${workout.id}`
                                                )
                                            }
                                            className="bg-green-500 text-black px-3 py-1 rounded hover:bg-green-400 transition"
                                        >
                                            🚀 Start Live Tracking
                                        </button>
                                        <button
                                            onClick={() =>
                                                deleteWorkout(workout.id)
                                            }
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan="6"
                                className="text-center text-yellow-400 py-4"
                            >
                                No workouts found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default WorkoutFeedFull
