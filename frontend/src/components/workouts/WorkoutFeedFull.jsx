import { useState, useEffect } from 'react'
import useWorkoutStore from '../../stores/workoutStore'
import WorkoutCreationForm from './WorkoutCreationForm'
import PanelButton from '../ui/PanelButton'
import { useNavigate } from 'react-router-dom'

const WorkoutFeedFull = () => {
    const navigate = useNavigate()
    const {
        workouts,
        loading,
        error,
        fetchAllWorkouts,
        deleteWorkout,
        duplicateWorkout,
    } = useWorkoutStore()

    const [isCreating, setIsCreating] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        fetchAllWorkouts()
    }, [])

    const handleDuplicate = async (workoutId) => {
        try {
            const newWorkout = await duplicateWorkout(workoutId)
            if (newWorkout?.id) {
                navigate(`/workouts/${newWorkout.id}`)
            }
        } catch (error) {
            console.error('Error duplicating workout:', error)
        }
    }

    const handleDelete = async (workoutId) => {
        if (window.confirm('Are you sure you want to delete this workout?')) {
            try {
                await deleteWorkout(workoutId)
            } catch (error) {
                console.error('Error deleting workout:', error)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <h2>Error loading workouts</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-gold">Your Workouts</h2>
                <PanelButton
                    onClick={() => setIsCreating(true)}
                    className="w-auto"
                >
                    Create Workout
                </PanelButton>
            </div>

            {/* Workouts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workouts.map((workout) => (
                    <div
                        key={workout.id}
                        className="bg-brand-dark-2 rounded-xl border border-brand-gold/30 p-6 shadow-lg"
                    >
                        <h3 className="text-xl font-bold text-brand-gold mb-4">
                            {workout.workout_name}
                        </h3>
                        <div className="space-y-2 mb-6">
                            <p className="text-gray-300">
                                <span className="font-semibold">Date:</span>{' '}
                                {new Date(workout.date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-300">
                                <span className="font-semibold">Status:</span>{' '}
                                {workout.complete ? '✅ Completed' : '⏳ In Progress'}
                            </p>
                            {workout.notes && (
                                <p className="text-gray-300">
                                    <span className="font-semibold">Notes:</span>{' '}
                                    {workout.notes}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <PanelButton
                                onClick={() => navigate(`/workouts/${workout.id}`)}
                                className="flex-1"
                            >
                                View
                            </PanelButton>
                            <PanelButton
                                onClick={() => handleDuplicate(workout.id)}
                                className="flex-1"
                            >
                                Duplicate
                            </PanelButton>
                            <PanelButton
                                onClick={() => handleDelete(workout.id)}
                                variant="danger"
                                className="flex-1"
                            >
                                Delete
                            </PanelButton>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Workout Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2 p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4">
                        <WorkoutCreationForm
                            onClose={() => {
                                setIsCreating(false)
                                setIsSubmitted(false)
                            }}
                            setIsCreating={setIsCreating}
                            setIsSubmitted={setIsSubmitted}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkoutFeedFull
