import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createWorkout } from '../../api/workoutsApi'
import useWorkoutStore from '../../stores/workoutStore'
import PanelButton from '../ui/PanelButton'
import { showToast } from '../../utils/toast'

const WorkoutCreationForm = ({ onClose }) => {
    const { fetchAllWorkouts } = useWorkoutStore()
    const { register, handleSubmit } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            await createWorkout(data)
            await fetchAllWorkouts()
            showToast('Workout created successfully!', 'success')
            onClose()
        } catch (error) {
            showToast('Failed to create workout.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-brand-gold">Create New Workout</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <label className="block">
                    Workout Name:
                    <input
                        {...register('workout_name', { required: true })}
                        className="w-full p-2 mt-1 rounded text-black"
                        placeholder="e.g., Upper Body Strength"
                    />
                </label>
                <label className="block">
                    Date:
                    <input
                        type="date"
                        {...register('date', { required: true })}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Notes:
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-1 rounded text-black"
                        placeholder="Optional workout notes..."
                    />
                </label>

                <PanelButton type="submit" disabled={isSubmitting} variant="gold" className="">
                    {isSubmitting ? 'Creating...' : 'Create Workout'}
                </PanelButton>
                <PanelButton type="button" onClick={onClose} variant="danger" className="">
                    Cancel
                </PanelButton>
            </form>
        </div>
    )
}

export default WorkoutCreationForm
