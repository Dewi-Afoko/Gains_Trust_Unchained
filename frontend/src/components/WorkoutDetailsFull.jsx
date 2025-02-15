import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import useWorkoutDetails from '../hooks/useWorkoutDetails'
import SetsTableFull from '../components/SetsTableFull'
import WorkoutEditForm from '../components/forms/WorkoutEditForm'

const WorkoutDetailsFull = ({ workoutId }) => {
    const { accessToken } = useContext(AuthContext)
    const { workout, sets, loading, error, setWorkout, setIsUpdating } =
        useWorkoutDetails(workoutId, accessToken)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const handleWorkoutUpdate = (updatedWorkout) => {
        setWorkout(updatedWorkout)
        setIsUpdating((prev) => !prev)
        setIsEditModalOpen(false)
    }

    if (loading) return <p className="text-white">Loading workout...</p>
    if (error) return <p className="text-red-500">Error: {error}</p>

    return (
        <div className="flex flex-col items-center w-full px-4">
            {/* Workout Details Card */}
            <div className="w-full max-w-6xl bg-[#600000] border border-yellow-400 shadow-lg p-6 text-white rounded-lg mb-6">
                <h2 className="text-2xl font-bold text-yellow-400">
                    {workout?.workout_name}
                </h2>
                <p>
                    <strong>Date:</strong>{' '}
                    {new Date(workout?.date).toLocaleDateString()}
                </p>
                <p>
                    <strong>User Weight:</strong>{' '}
                    {workout?.user_weight || 'N/A'} kg
                </p>
                <p>
                    <strong>Sleep Score:</strong>{' '}
                    {workout?.sleep_score || 'N/A'}
                </p>
                <p>
                    <strong>Sleep Quality:</strong>{' '}
                    {workout?.sleep_quality || 'N/A'}
                </p>
                <p>
                    <strong>Notes:</strong> {workout?.notes || 'N/A'}
                </p>

                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition mt-4"
                >
                    Edit Workout
                </button>

                {isEditModalOpen && (
                    <WorkoutEditForm
                        workout={workout}
                        workoutId={workoutId}
                        accessToken={accessToken}
                        onClose={() => setIsEditModalOpen(false)}
                        onUpdate={handleWorkoutUpdate}
                    />
                )}
            </div>

            {/* Sets Table Card */}
            <div className="w-full max-w-6xl bg-[#600000] border border-yellow-400 shadow-lg p-6 text-white rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">
                    Workout Sets
                </h3>
                <SetsTableFull
                    sets={sets}
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onSetUpdated={setIsUpdating}
                />
            </div>
        </div>
    )
}

export default WorkoutDetailsFull
