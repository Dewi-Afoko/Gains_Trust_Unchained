import { useState } from 'react'
import { useWorkoutContext, WorkoutProvider } from '../../providers/WorkoutContext' // ✅ Use context
import WorkoutEditForm from '../workouts/WorkoutEditForm'
import SetsTablePreview from '../sets/SetsTablePreview'
import SetCreationForm from '../sets/SetCreationForm'

const WorkoutDetailsPreview = ({ workoutId }) => {
    const { workout, sets, loading, updateWorkout, fetchAllWorkouts } =
        useWorkoutContext() // ✅ Get values from context
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false)

    const handleWorkoutUpdate = async (updatedWorkout) => {
        await updateWorkout(workoutId, updatedWorkout) // ✅ Update via context
        fetchAllWorkouts() // ✅ Refresh all workouts to reflect changes
        setIsEditModalOpen(false)
    }

    const handleSetAdded = () => {
        fetchAllWorkouts() // ✅ Re-fetch sets after adding a new one
        setIsSetModalOpen(false)
    }

    if (loading) return <p className="text-white">Loading workout...</p>
    if (!workout) return <p className="text-red-500">Workout not found.</p>

    return (
        <div className="w-full max-w-4xl bg-[#600000] border border-yellow-400 shadow-lg p-6 text-white rounded-lg">
            <h2 className="text-xl font-bold text-yellow-400">
                {workout?.workout_name}
            </h2>
            <p>
                <strong>Date:</strong>{' '}
                {new Date(workout?.date).toLocaleDateString()}
            </p>
            <p>
                <strong>Notes:</strong> {workout?.notes || 'N/A'}
            </p>

            {/* Buttons for Editing Workout & Adding Set */}
            <div className="flex space-x-4 mt-4">
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
                >
                    Edit Workout
                </button>
                <button
                    onClick={() => setIsSetModalOpen(true)}
                    className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 transition"
                >
                    Add Set
                </button>
            </div>

            {/* Edit Workout Modal */}
            {isEditModalOpen && (
                <WorkoutEditForm
                    workout={workout}
                    workoutId={workoutId}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={handleWorkoutUpdate}
                />
            )}

            {/* Add Set Modal */}
            {isSetModalOpen && (
                <SetCreationForm
                    workoutId={workoutId}
                    onClose={() => setIsSetModalOpen(false)}
                    onSetCreated={handleSetAdded}
                />
            )}

            {/* ✅ Sets Table Preview Component ✅ */}
            <WorkoutProvider workoutId={workoutId}>
                <SetsTablePreview sets={sets} />
            </WorkoutProvider>
        </div>
    )
}

export default WorkoutDetailsPreview
