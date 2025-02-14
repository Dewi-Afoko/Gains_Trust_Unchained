import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import useWorkoutDetails from '../hooks/useWorkoutDetails'
import WorkoutEditForm from './forms/WorkoutEditForm'
import SetsTablePreview from '../components/SetsTablePreview'

const WorkoutDetailsPreview = ({ workoutId }) => {
    const { accessToken } = useContext(AuthContext)
    const { workout, sets, loading, error, setWorkout, setIsUpdating } =
        useWorkoutDetails(workoutId, accessToken)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleWorkoutUpdate = (updatedWorkout) => {
        setWorkout(updatedWorkout)
        setIsUpdating((prev) => !prev) // Trigger re-fetch
        setIsModalOpen(false)
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

            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition mt-4"
            >
                Edit Workout
            </button>

            {/* Edit Modal */}
            {isModalOpen && (
                <WorkoutEditForm
                    workout={workout}
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={handleWorkoutUpdate}
                />
            )}

            {/* ✅ Sets Table Preview Component ✅ */}
            <SetsTablePreview sets={sets} />
        </div>
    )
}

export default WorkoutDetailsPreview
