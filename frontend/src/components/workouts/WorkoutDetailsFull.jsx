import React, { useState, useEffect } from 'react'
import useWorkoutStore from '../../stores/workoutStore'
import WorkoutEditForm from './WorkoutEditForm'
import SetsTableFull from '../sets/SetsTableFull'
import SetCreationForm from '../sets/SetCreationForm'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useNavigate, useParams } from 'react-router-dom'
import PanelHeader from '../ui/PanelHeader'
import PanelButton from '../ui/PanelButton'

// Helper function to determine workout status
const getWorkoutStatus = (workout) => {
    if (!workout) return 'N/A'
    if (workout.duration) {
        return `✅ Completed in ${new Date(workout.duration * 1000).toISOString().substr(11, 8)}`
    }
    if (workout.start_time) {
        return '🔥 In Progress'
    }
    return '⏳ Not Started'
}

const WorkoutDetailsFull = () => {
    const { workoutId } = useParams()
    const navigate = useNavigate()
    const {
        workout,
        loading,
        error,
        fetchWorkoutDetails,
        updateWorkout,
        toggleComplete,
        startWorkout,
    } = useWorkoutStore()

    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false)

    useEffect(() => {
        if (workoutId) {
            fetchWorkoutDetails(workoutId)
        }
    }, [workoutId])

    const handleWorkoutUpdate = async (updatedWorkout) => {
        await updateWorkout(workoutId, updatedWorkout)
        setIsWorkoutModalOpen(false)
    }

    const handleSetUpdated = () => {
        setIsSetModalOpen(false)
        fetchWorkoutDetails(workoutId)
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <h2>Error loading workout</h2>
                <p>{error}</p>
            </div>
        )
    }

    if (!workout && !loading) {
        return (
            <div className="text-center text-yellow-400 p-4">
                <h2>Workout not found</h2>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            {loading && <LoadingSpinner />}

            {/* Header */}
            <PanelHeader
                title={workout?.workout_name || 'Loading...'}
                className="mb-6"
            />

            {/* Workout Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#500000] p-4 rounded-lg border border-yellow-400">
                    <h3 className="text-yellow-400 font-bold">Date</h3>
                    <p className="text-white">
                        {workout?.date
                            ? new Date(workout.date).toLocaleDateString()
                            : 'N/A'}
                    </p>
                </div>
                <div className="bg-[#500000] p-4 rounded-lg border border-yellow-400">
                    <h3 className="text-yellow-400 font-bold">Status</h3>
                    <p className="text-white">{getWorkoutStatus(workout)}</p>
                </div>
                <div className="bg-[#500000] p-4 rounded-lg border border-yellow-400">
                    <h3 className="text-yellow-400 font-bold">Notes</h3>
                    <p className="text-white">{workout?.notes || 'No notes'}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
                <PanelButton
                    onClick={() => setIsWorkoutModalOpen(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white w-auto"
                >
                    ✏️ Edit Workout
                </PanelButton>
                <PanelButton
                    onClick={() => setIsSetModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white w-auto"
                >
                    ➕ Add Set
                </PanelButton>
                {!workout?.start_time && (
                    <PanelButton
                        onClick={() => startWorkout(workoutId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-auto"
                    >
                        🏃 Start Workout
                    </PanelButton>
                )}
                {workout?.start_time !== null && !workout?.complete && (
                    <PanelButton
                        onClick={() => toggleComplete(workoutId)}
                        className="bg-green-700 hover:bg-green-800 text-white w-auto"
                    >
                        🏁 Mark Complete
                    </PanelButton>
                )}
            </div>

            {/* Sets Table */}
            <SetsTableFull hideCompleteButton={true} />

            {/* Modals */}
            {isWorkoutModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2 p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4">
                        <WorkoutEditForm
                            workout={workout}
                            onClose={() => setIsWorkoutModalOpen(false)}
                            onUpdate={handleWorkoutUpdate}
                        />
                    </div>
                </div>
            )}

            {isSetModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2 p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4">
                        <SetCreationForm
                            workoutId={workoutId}
                            onClose={() => setIsSetModalOpen(false)}
                            onSetCreated={handleSetUpdated}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkoutDetailsFull
