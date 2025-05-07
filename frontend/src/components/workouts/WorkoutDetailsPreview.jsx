import { useState } from 'react'
import {
    useWorkoutContext,
    WorkoutProvider,
} from '../../providers/WorkoutContext' // ✅ Use context
import WorkoutEditForm from '../workouts/WorkoutEditForm'
import SetsTablePreview from '../sets/SetsTablePreview'
import SetCreationForm from '../sets/SetCreationForm'

const Spinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
)

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

    // If no workout at all (first load or invalid), show not found
    if (!workout && !loading) {
        return (
            <div className="flex flex-1 items-center justify-center w-full h-full">
                <span className="text-brand-red">Workout not found.</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Spinner overlay while loading, but keep previous data visible */}
            {loading && <Spinner />}
            {workout && (
                <>
                    <h2 className="text-xl font-bold text-brand-gold mb-4">
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
                            className="bg-brand-gold text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
                        >
                            Edit Workout
                        </button>
                        <button
                            onClick={() => setIsSetModalOpen(true)}
                            className="bg-brand-green text-black px-4 py-2 rounded hover:bg-green-400 transition"
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
                    <SetsTablePreview sets={sets} />
                </>
            )}
        </div>
    )
}

export default WorkoutDetailsPreview
