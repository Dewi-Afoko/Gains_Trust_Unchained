import { useState, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import useWorkoutDetails from '../hooks/useWorkoutDetails'
import WorkoutEditForm from './forms/WorkoutEditForm'
import SetsTableFull from './sets/SetsTableFull'
import SetCreationForm from './forms/SetCreationForm'
import LoadingSpinner from './ui/LoadingSpinner'

const WorkoutDetailsFull = ({ workoutId }) => {
    const { accessToken } = useContext(AuthContext)
    const { workout, sets, loading, error, setWorkout, updateSingleSet } =
        useWorkoutDetails(workoutId, accessToken)
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false)

    const handleWorkoutUpdate = (updatedWorkout) => {
        setWorkout(updatedWorkout)
        setIsWorkoutModalOpen(false)
    }

    const handleSetUpdated = (updatedSet) => {
        updateSingleSet(updatedSet) // ✅ Update only the modified set, no re-fetch
    }

    if (loading) return <LoadingSpinner />
    if (error) return <p className="text-red-500">Error: {error}</p>

    return (
        <div className="w-full max-w-6xl mx-auto text-white">
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

                <button
                    onClick={() => setIsSetModalOpen(true)}
                    className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-400 transition mt-4 ml-4"
                >
                    Add Set
                </button>
            </div>

            {/* ✅ Pass updateSingleSet down the tree */}
            <SetsTableFull
                sets={sets}
                workoutId={workoutId}
                accessToken={accessToken}
                updateSingleSet={updateSingleSet} // ✅ Fix: Ensure function is passed down
            />

            {isWorkoutModalOpen && (
                <WorkoutEditForm
                    workout={workout}
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onClose={() => setIsWorkoutModalOpen(false)}
                    onUpdate={handleWorkoutUpdate}
                />
            )}

            {isSetModalOpen && (
                <SetCreationForm
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onSetCreated={handleSetUpdated}
                    onClose={() => setIsSetModalOpen(false)}
                />
            )}
        </div>
    )
}

export default WorkoutDetailsFull
