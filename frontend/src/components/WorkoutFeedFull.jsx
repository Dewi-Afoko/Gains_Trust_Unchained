import { useWorkoutContext } from '../context/WorkoutContext'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const WorkoutFeedFull = () => {
    const {
        workouts,
        workoutSets,
        loading,
        fetchAllWorkouts,
        toggleComplete,
        deleteWorkout,
    } = useWorkoutContext()

    const navigate = useNavigate()
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, workoutId: null })

    useEffect(() => {
        fetchAllWorkouts() // ✅ Load all workouts when component mounts
    }, [])

    const handleDelete = (workoutId) => {
        setDeleteModal({ isOpen: true, workoutId })
    }

    const confirmDelete = () => {
        if (deleteModal.workoutId) {
            deleteWorkout(deleteModal.workoutId)
        }
        setDeleteModal({ isOpen: false, workoutId: null })
    }

    if (loading) return <p className="text-yellow-400 text-center">Loading workouts...</p>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {workouts.length > 0 ? (
                workouts.map((workout) => {
                    const sets = workoutSets[workout.id] || []
                    const totalSets = sets.length
                    const exerciseCounts = sets.reduce((acc, set) => {
                        acc[set.exercise_name] = (acc[set.exercise_name] || 0) + 1
                        return acc
                    }, {})

                    return (
                        <div
                            key={workout.id}
                            className="bg-[#400000] text-white p-6 rounded-xl shadow-xl border border-yellow-400"
                        >
                            <h3
                                className="text-yellow-400 text-2xl font-extrabold cursor-pointer hover:text-yellow-200"
                                onClick={() => navigate(`/workouts/${workout.id}/full`)}
                            >
                                🏋🏾‍♂️ {workout.workout_name}
                            </h3>
                            <p className="text-md text-gray-300">
                                📅 {new Date(workout.date).toLocaleDateString()}
                            </p>
                            <p className="text-md text-gray-400">
                                📝 {workout.notes || 'No notes'}
                            </p>
                            <p className="text-md text-yellow-300">💪🏾 Exercises:</p>
                            <ul className="text-yellow-300">
                                {Object.entries(exerciseCounts).map(([exercise, count]) => (
                                    <li key={exercise} className="ml-4">{count}x {exercise}</li>
                                ))}
                            </ul>
                            <p className="text-md text-yellow-400">🔥 Total Sets: {totalSets}</p>
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => toggleComplete(workout.id, workout.complete)}
                                    className={`px-4 py-2 rounded-xl text-white font-bold transition ${
                                        workout.complete
                                            ? 'bg-[#222222] hover:bg-[#333333]'
                                            : 'bg-[#B22222] hover:bg-[#8B0000]'
                                    }`}
                                >
                                    {workout.complete ? '⚡ Completed' : '⏳ In Progress'}
                                </button>
                                <button
                                    onClick={() => navigate(`/livetracking/${workout.id}`)}
                                    className="bg-gradient-to-r from-[#8B0000] via-[#D35400] to-[#FFD700] text-white font-bold px-4 py-2 rounded-xl hover:from-[#B22222] hover:to-[#FFC107] transition"
                                >
                                    🚀 Start Live Tracking
                                </button>
                                <button
                                    onClick={() => handleDelete(workout.id)}
                                    className="bg-[#8B0000] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#600000] transition"
                                >
                                    💀 Delete
                                </button>
                            </div>
                        </div>
                    )
                })
            ) : (
                <p className="text-yellow-400 text-center col-span-full text-lg">
                    No workouts found.
                </p>
            )}

            {/* ✅ Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-[#600000] p-6 rounded-lg shadow-lg text-white max-w-sm">
                        <h3 className="text-lg font-bold text-yellow-400">Confirm Deletion</h3>
                        <p className="mt-2">Are you sure you want to delete this workout? This action cannot be undone.</p>
                        <div className="flex justify-end mt-4 space-x-3">
                            <button
                                className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-400 transition"
                                onClick={() => setDeleteModal({ isOpen: false, workoutId: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 px-4 py-2 rounded hover:bg-red-400 transition"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkoutFeedFull
