import { useState } from 'react'
import { useWorkoutContext } from '../../context/WorkoutContext' // ✅ Use WorkoutContext
import WorkoutEditForm from '../forms/WorkoutEditForm'
import SetsTableFull from '../sets/SetsTableFull'
import SetCreationForm from '../sets/SetCreationForm'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

const WorkoutDetailsFull = () => {
    const {
        workout,
        sets,
        loading,
        error,
        setWorkout,
        updateSingleSet,
        toggleComplete,
        deleteWorkout,
    } = useWorkoutContext()
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false)
    const navigate = useNavigate()

    const handleWorkoutUpdate = (updatedWorkout) => {
        setWorkout(updatedWorkout) // ✅ Update workout in context
        setIsWorkoutModalOpen(false)
    }

    const handleSetUpdated = (updatedSet) => {
        updateSingleSet(updatedSet) // ✅ Update only the modified set
    }

    const handleDeleteWorkout = async () => {
        if (!workout?.id) return

        try {
            await deleteWorkout(workout.id)
            navigate('/workouts') // ✅ Redirect after deletion
        } catch (error) {
            console.error('❌ Error deleting workout:', error)
        }
    }

    if (loading) return <LoadingSpinner />
    if (error) return <p className="text-red-500">Error: {error}</p>
    if (!workout) return <p className="text-yellow-400">Workout not found.</p> // ✅ Prevents crash

    return (
        <div className="w-full max-w-6xl mx-auto text-white">
            {/* 🏋🏾‍♂️ Workout Header */}
            <div className="bg-[#600000] border border-yellow-400 shadow-lg p-6 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-yellow-400">
                    {workout?.workout_name}
                </h2>

                {/* ✅ Show Completed Duration if workout is complete */}
                {workout?.duration && (
                    <p className="text-yellow-300 text-lg font-bold">
                        Completed In:{' '}
                        {new Date(workout.duration * 1000)
                            .toISOString()
                            .substr(11, 8)}
                    </p>
                )}

                <p>
                    <strong>Date:</strong>{' '}
                    {new Date(workout?.date).toLocaleDateString()}
                </p>
                <p>
                    <strong>Notes:</strong> {workout?.notes || 'N/A'}
                </p>

                {/* 🔘 Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-4">
                    {/* ✏️ Edit Workout */}
                    <button
                        onClick={() => setIsWorkoutModalOpen(true)}
                        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
                    >
                        Edit Workout
                    </button>

                    {/* ➕ Add Set */}
                    <button
                        onClick={() => setIsSetModalOpen(true)}
                        className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-400 transition"
                    >
                        Add Set
                    </button>

                    {/* 🚀 Start Live Tracking */}
                    <button
                        onClick={() => navigate(`/livetracking/${workout.id}`)}
                        className="bg-gradient-to-r from-[#8B0000] via-[#D35400] to-[#FFD700] text-white font-bold px-4 py-2 rounded-xl hover:from-[#B22222] hover:to-[#FFC107] transition"
                    >
                        🚀 Start Live Tracking
                    </button>

                    {/* ❌ Delete Workout */}
                    <button
                        onClick={() => handleDeleteWorkout()}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition"
                    >
                        Delete Workout
                    </button>

                    {/* 🏁 Mark Complete - Only Shows If Workout is In Progress */}
                    {workout.start_time !== null && !workout.complete && (
                        <button
                            onClick={() => toggleComplete(workout.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
                        >
                            🏁 Mark Complete
                        </button>
                    )}
                </div>
            </div>

            {/* 🏋🏾‍♂️ Sets Table (No Complete Button) */}
            <SetsTableFull hideCompleteButton={true} />

            {/* 🔄 Modals */}
            {isWorkoutModalOpen && (
                <WorkoutEditForm
                    workout={workout}
                    onClose={() => setIsWorkoutModalOpen(false)}
                    onUpdate={handleWorkoutUpdate}
                />
            )}

            {isSetModalOpen && (
                <SetCreationForm
                    onSetCreated={handleSetUpdated}
                    onClose={() => setIsSetModalOpen(false)}
                />
            )}
        </div>
    )
}

export default WorkoutDetailsFull
