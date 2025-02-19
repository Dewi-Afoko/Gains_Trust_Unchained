import { useState, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import useWorkoutDetails from '../hooks/useWorkoutDetails'
import WorkoutEditForm from './forms/WorkoutEditForm'
import SetsTableFull from './sets/SetsTableFull'
import SetCreationForm from './forms/SetCreationForm' // ✅ Import the form

const WorkoutDetailsFull = ({ workoutId }) => {
    const { accessToken } = useContext(AuthContext)
    const { workout, sets, loading, error, setWorkout, setIsUpdating } =
        useWorkoutDetails(workoutId, accessToken)
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false) // ✅ Track "Add Set" modal state

    const handleWorkoutUpdate = (updatedWorkout) => {
        setWorkout(updatedWorkout)
        setIsUpdating((prev) => !prev)
        setIsWorkoutModalOpen(false)
    }

    const handleSetUpdated = (updatedSet) => {
        setIsUpdating((prev) => !prev) // ✅ Trigger re-fetch of sets
    }

    if (loading) return <p className="text-white">Loading workout...</p>
    if (error) return <p className="text-red-500">Error: {error}</p>

    return (
        <div className="w-full max-w-6xl mx-auto text-white">
            {/* Workout Details Card */}
            <div className="bg-[#600000] border border-yellow-400 shadow-lg p-6 rounded-lg mb-6">
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
                    onClick={() => setIsWorkoutModalOpen(true)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition mt-4"
                >
                    Edit Workout
                </button>

                {/* ✅ New "Add Set" Button */}
                <button
                    onClick={() => setIsSetModalOpen(true)}
                    className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-400 transition mt-4 ml-4"
                >
                    Add Set
                </button>
            </div>

            {/* ✅ Render Sets Table */}
            <SetsTableFull
                sets={sets}
                workoutId={workoutId}
                accessToken={accessToken}
                onSetUpdated={handleSetUpdated}
            />

            {/* Edit Workout Modal */}
            {isWorkoutModalOpen && (
                <WorkoutEditForm
                    workout={workout}
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onClose={() => setIsWorkoutModalOpen(false)}
                    onUpdate={handleWorkoutUpdate}
                />
            )}

            {/* ✅ Add Set Modal */}
            {isSetModalOpen && (
                <SetCreationForm
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onSetCreated={(newSet) => {
                        setIsUpdating((prev) => !prev) // ✅ Refresh the table
                    }}
                    onClose={() => setIsSetModalOpen(false)}
                />
            )}
        </div>
    )
}

export default WorkoutDetailsFull
