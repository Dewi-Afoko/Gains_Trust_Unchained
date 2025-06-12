import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createWorkout } from '../../api/workoutsApi'
import useWorkoutStore from '../../stores/workoutStore'
import PanelButton from '../ui/PanelButton'
import { showToast } from '../../utils/toast'

const WorkoutCreationForm = ({ onClose }) => {
    const { fetchAllWorkouts } = useWorkoutStore()
    const { register, handleSubmit, formState: { errors } } = useForm()
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
        <div className="bg-brand-dark-2 text-white p-8 rounded-xl border-2 border-brand-gold shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-brand-gold mb-6 text-center tracking-wide">Create New Workout</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <label className="block text-brand-gold font-semibold mb-1">
                    Workout Name:
                    <input
                        {...register('workout_name', { required: 'Workout name is required' })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="e.g., Upper Body Strength"
                    />
                    {errors?.workout_name && (
                        <p className="mt-1 text-sm text-red-400">{errors.workout_name.message}</p>
                    )}
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Date:
                    <input
                        type="date"
                        {...register('date', { required: 'Date is required' })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                    />
                    {errors?.date && (
                        <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
                    )}
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Notes:
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="Optional workout notes..."
                    />
                </label>

                <div className="flex gap-4 pt-4">
                    <PanelButton type="submit" disabled={isSubmitting} variant="gold" className="flex-1">
                        {isSubmitting ? 'Creating...' : 'Create Workout'}
                    </PanelButton>
                    <PanelButton type="button" onClick={onClose} variant="danger" className="flex-1">
                        Cancel
                    </PanelButton>
                </div>
            </form>
        </div>
    )
}

export default WorkoutCreationForm
