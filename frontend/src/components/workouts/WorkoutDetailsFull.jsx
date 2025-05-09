import React, { useState, useEffect, useCallback } from 'react'
import { useWorkoutContext } from '../../context/WorkoutContext' // ✅ Use WorkoutContext
import WorkoutEditForm from '../forms/WorkoutEditForm'
import SetsTableFull from '../sets/SetsTableFull'
import SetCreationForm from '../forms/SetCreationForm'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import workoutsApi from '../../api/workoutsApi' 
import PanelHeader from '../ui/PanelHeader'
import PanelButton from '../ui/PanelButton'

// Helper function to determine workout status
const getWorkoutStatus = (workout) => {
    if (!workout) return 'N/A';
    if (workout.duration) {
        return `✅ Completed in ${new Date(workout.duration * 1000).toISOString().substr(11, 8)}`;
    }
    if (workout.start_time) {
        return '🔥 In Progress';
    }
    return '⏳ Not Started';
};

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
        <div className="relative w-full h-full flex flex-col p-4 md:p-6 bg-brand-dark-2 rounded-xl shadow-2xl border border-brand-gold overflow-y-auto">
            <PanelHeader title={workout?.workout_name || 'Loading Workout...'} />
            <div className="space-y-2 mb-6">
                <p><strong>Date:</strong> {workout ? new Date(workout.date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Notes:</strong> {workout?.notes || 'N/A'}</p>
                <p><strong>Status:</strong> {getWorkoutStatus(workout)}</p>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 mb-6">
                {/* ✏️ Edit Workout */}
                <PanelButton
                    onClick={() => setIsWorkoutModalOpen(true)}
                    className="text-black w-auto hover:bg-yellow-600"
                >
                    Edit Workout
                </PanelButton>

                {/* ➕ Add Set */}
                <PanelButton
                    onClick={() => setIsSetModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-black w-auto"
                >
                    Add Set
                </PanelButton>

                {/* 🚀 Start Live Tracking */}
                <PanelButton
                    onClick={() => navigate(`/livetracking/${workout.id}`)}
                    className="text-white font-bold w-auto bg-gradient-to-r from-[#8B0000] via-[#D35400] to-[#FFD700] hover:from-[#B22222] hover:to-[#FFC107]"
                >
                    🚀 Start Live Tracking
                </PanelButton>

                {/* ❌ Delete Workout */}
                <PanelButton
                    onClick={() => handleDeleteWorkout()}
                    className="bg-red-700 hover:bg-red-800 text-white w-auto"
                >
                    Delete Workout
                </PanelButton>

                {/* 🏁 Mark Complete - Only Shows If Workout is In Progress */}
                {workout?.start_time !== null && !workout?.complete && (
                    <PanelButton
                        onClick={() => toggleComplete(workout.id)}
                        className="bg-green-700 hover:bg-green-800 text-white w-auto"
                    >
                        🏁 Mark Complete
                    </PanelButton>
                )}
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
