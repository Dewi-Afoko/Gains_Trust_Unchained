import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AuthContext from '../context/AuthContext'
import WorkoutEditForm from './forms/WorkoutEditForm'

const WorkoutFeedFull = () => {
    const { accessToken } = useContext(AuthContext)
    const [workouts, setWorkouts] = useState([])
    const [workoutSets, setWorkoutSets] = useState({})
    const [editingWorkoutId, setEditingWorkoutId] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchWorkouts()
    }, [accessToken])

    // Fetch workouts
    const fetchWorkouts = async () => {
        try {
            console.log('📡 Fetching workouts...')
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            const fetchedWorkouts = response.data.workouts || []
            setWorkouts(fetchedWorkouts)

            // Fetch sets for each workout
            fetchedWorkouts.forEach((workout) => fetchWorkoutSets(workout.id))
        } catch (error) {
            console.error('❌ Error fetching workouts:', error)
            setWorkouts([])
        }
    }

    // Fetch sets for a specific workout
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

    // ✅ Toggle Workout Completion
    const toggleComplete = async (workoutId, currentState) => {
        try {
            console.log(
                `📡 Toggling complete status for workout ${workoutId}...`
            )

            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                { complete: !currentState }, // Toggle complete state
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            console.log('✅ Workout completion updated:', response.data)

            // ✅ Update state immediately after toggling complete
            setWorkouts((prev) =>
                prev.map((w) =>
                    w.id === workoutId ? { ...w, complete: !currentState } : w
                )
            )
        } catch (error) {
            console.error('❌ Error updating workout:', error)
        }
    }

    // ✅ Duplicate Workout - Ensure Sets Are Created After Workout
    const duplicateWorkout = async (workout) => {
        try {
            console.log(`📡 Duplicating workout ${workout.id}...`)

            // Step 1: Create new workout first
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/`,
                {
                    workout_name: workout.workout_name,
                    user_weight: workout.user_weight,
                    sleep_score: workout.sleep_score,
                    sleep_quality: workout.sleep_quality,
                    notes: workout.notes,
                },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            const newWorkout = response.data.workout // Ensure correct property
            console.log('✅ New workout created:', newWorkout)

            // Step 2: Ensure new workout ID exists before proceeding
            if (!newWorkout || !newWorkout.id) {
                console.error('❌ Error: New workout ID is missing.')
                return
            }

            // Step 3: Fetch existing sets for the original workout
            const setsResponse = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workout.id}/sets/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            const sets = setsResponse.data.sets || []

            // Step 4: Create sets for the new workout (only if sets exist)
            if (sets.length > 0) {
                await Promise.all(
                    sets.map((set) =>
                        axios.post(
                            `${process.env.REACT_APP_API_BASE_URL}/workouts/${newWorkout.id}/sets/`,
                            {
                                exercise_name: set.exercise_name,
                                set_type: set.set_type,
                                loading: set.loading,
                                reps: set.reps,
                                rest: set.rest,
                                focus: set.focus,
                                notes: set.notes,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                            }
                        )
                    )
                )

                console.log('✅ All sets duplicated successfully.')
            } else {
                console.log('ℹ No sets to duplicate.')
            }

            fetchWorkouts() // ✅ Ensure table updates
        } catch (error) {
            console.error('❌ Error duplicating workout:', error)
        }
    }

    // ✅ Ensure Frontend Updates After Editing
    const handleEditClick = (workoutId) => {
        console.log(`📝 Editing workout ${workoutId}...`)
        setEditingWorkoutId(workoutId)
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
                                                duplicateWorkout(workout)
                                            }
                                            className="bg-blue-500 text-black px-3 py-1 rounded hover:bg-blue-400 transition"
                                        >
                                            Duplicate
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleEditClick(workout.id)
                                            }
                                            className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300 transition"
                                        >
                                            Edit
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

            {/* ✅ Ensure Edit Modal is Rendered */}
            {editingWorkoutId && (
                <WorkoutEditForm
                    workout={workouts.find((w) => w.id === editingWorkoutId)}
                    workoutId={editingWorkoutId}
                    accessToken={accessToken}
                    onClose={() => {
                        setEditingWorkoutId(null)
                        fetchWorkouts() // ✅ Ensure table updates after editing
                    }}
                    onUpdate={(updatedWorkout) => {
                        setWorkouts((prev) =>
                            prev.map((w) =>
                                w.id === updatedWorkout.id ? updatedWorkout : w
                            )
                        )
                    }}
                />
            )}
        </div>
    )
}
export default WorkoutFeedFull
