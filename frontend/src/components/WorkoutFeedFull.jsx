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
        if (accessToken) fetchWorkouts();
    }, []);  // Remove accessToken dependency unless token refresh is frequent
    

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

    const deleteWorkout = async (workoutId) => {
        try {
            console.log(`🔥 Deleting workout ${workoutId}...`)
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            console.log('💀 Workout deleted successfully')
            setWorkouts((prev) => prev.filter((w) => w.id !== workoutId))
        } catch (error) {
            console.error('❌ Error deleting workout:', error)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {workouts.length > 0 ? (
                workouts.map((workout) => {
                    const sets = workoutSets[workout.id] || []
                    const totalSets = sets.length
                    const exerciseCounts = sets.reduce((acc, set) => {
                        acc[set.exercise_name] =
                            (acc[set.exercise_name] || 0) + 1
                        return acc
                    }, {})

                    return (
                        <div
                            key={workout.id}
                            className="bg-[#400000] text-white p-6 rounded-xl shadow-xl border border-yellow-400"
                        >
                            <h3
                                className="text-yellow-400 text-2xl font-extrabold cursor-pointer hover:text-yellow-200 text-stroke"
                                onClick={() =>
                                    navigate(`/workouts/${workout.id}/full`)
                                }
                            >
                                🏋🏾‍♂️ {workout.workout_name}
                            </h3>
                            <p className="text-md text-gray-300">
                                📅 {new Date(workout.date).toLocaleDateString()}
                            </p>
                            <p className="text-md text-gray-400">
                                📝 {workout.notes || 'No notes'}
                            </p>
                            <p className="text-md text-yellow-300">
                                💪🏾 Exercises:
                            </p>
                            <ul className="text-yellow-300">
                                {Object.entries(exerciseCounts).map(
                                    ([exercise, count]) => (
                                        <li
                                            key={exercise}
                                            className="ml-4 text-stroke"
                                        >
                                            ({count}x) {exercise}
                                        </li>
                                    )
                                )}
                            </ul>
                            <p className="text-md text-yellow-400 text-stroke">
                                🔥 Total Sets: {totalSets}
                            </p>
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() =>
                                        toggleComplete(
                                            workout.id,
                                            workout.complete
                                        )
                                    }
                                    className={`px-4 py-2 rounded-xl text-white font-bold transition text-stroke ${
                                        workout.complete
                                            ? 'bg-[#222222] hover:bg-[#333333]'
                                            : 'bg-[#B22222] hover:bg-[#8B0000]'
                                    }`}
                                >
                                    {workout.complete
                                        ? '⚡ Completed'
                                        : '⏳ In Progress'}
                                </button>
                                <button
                                    onClick={() =>
                                        navigate(`/livetracking/${workout.id}`)
                                    }
                                    className="bg-gradient-to-r from-[#8B0000] via-[#D35400] to-[#FFD700] text-white font-bold px-4 py-2 rounded-xl hover:from-[#B22222] hover:to-[#FFC107] transition text-stroke"
                                >
                                    🚀 Start Live Tracking
                                </button>
                                <button
                                    onClick={() => deleteWorkout(workout.id)}
                                    className="bg-[#8B0000] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#600000] transition text-stroke"
                                >
                                    💀 Delete
                                </button>
                            </div>
                        </div>
                    )
                })
            ) : (
                <p className="text-yellow-400 text-center col-span-full text-lg text-stroke">
                    No workouts found.
                </p>
            )}
        </div>
    )
}

export default WorkoutFeedFull
