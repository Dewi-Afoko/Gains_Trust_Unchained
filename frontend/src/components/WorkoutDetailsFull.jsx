import { useState } from 'react'
import { useWorkoutContext } from '../context/WorkoutContext' // ✅ Use WorkoutContext
import WorkoutEditForm from './forms/WorkoutEditForm'
import SetsTableFull from './sets/SetsTableFull'
import SetCreationForm from './forms/SetCreationForm'
import LoadingSpinner from './ui/LoadingSpinner'

const WorkoutDetailsFull = () => {
    const { workout, sets, loading, error, setWorkout, updateSingleSet } = useWorkoutContext()
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false)

    const handleWorkoutUpdate = (updatedWorkout) => {
        setWorkout(updatedWorkout) // ✅ Update workout in context
        setIsWorkoutModalOpen(false)
    }

    const handleSetUpdated = (updatedSet) => {
        updateSingleSet(updatedSet) // ✅ Update only the modified set
    }

    console.log("🟢 WorkoutDetailsFull - Received Workout:", workout);
    console.log("🟢 WorkoutDetailsFull - Received Sets:", sets);
    

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

            {/* ✅ No more props, uses context instead */}
            <SetsTableFull hideCompleteButton={true} />

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
