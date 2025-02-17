import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import useWorkoutDetails from '../hooks/useWorkoutDetails'
import WorkoutEditForm from './forms/WorkoutEditForm'
import SetsTablePreview from '../components/SetsTablePreview'
import SetCreationForm from './forms/SetCreationForm'

const WorkoutDetailsPreview = ({ workoutId }) => {
    const { accessToken } = useContext(AuthContext)
    const { workout, sets, loading, error, setWorkout, setIsUpdating } =
        useWorkoutDetails(workoutId, accessToken)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false)

    const handleWorkoutUpdate = (updatedWorkout) => {
        setWorkout(updatedWorkout)
        setIsUpdating((prev) => !prev) // Trigger re-fetch
        setIsEditModalOpen(false)
    }

    const handleSetAdded = (newSet) => {
        setIsUpdating((prev) => !prev) // Re-fetch sets after adding a new one
        setIsSetModalOpen(false)
    }

    if (loading) return <p className="text-white">Loading workout...</p>
    if (error) return <p className="text-red-500">Error: {error}</p>

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
                    accessToken={accessToken}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={handleWorkoutUpdate}
                />
            )}

            {/* Add Set Modal */}
            {isSetModalOpen && (
                <SetCreationForm
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onClose={() => setIsSetModalOpen(false)}
                    onSetCreated={handleSetAdded}
                />
            )}

            {/* ✅ Sets Table Preview Component ✅ */}
            <SetsTablePreview sets={sets} />
        </div>
    )
}

export default WorkoutDetailsPreview
