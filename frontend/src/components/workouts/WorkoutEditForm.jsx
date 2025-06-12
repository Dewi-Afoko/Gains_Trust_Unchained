import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import useWorkoutStore from '../../stores/workoutStore'
import PanelButton from '../ui/PanelButton'

const WorkoutEditForm = ({ workout, workoutId, onClose, onUpdate }) => {
    const { updateWorkout } = useWorkoutStore()
    const { register, handleSubmit, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (workout) {
            setValue('workout_name', workout.workout_name || '')
            setValue('user_weight', workout.user_weight || '')
            setValue('sleep_score', workout.sleep_score || '')
            setValue('sleep_quality', workout.sleep_quality || '')
            setValue('notes', workout.notes || '')
            setValue('date', workout.date ? workout.date.split('T')[0] : '')
        }
    }, [workout, setValue])

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const updatedFields = {
                workout_name: data.workout_name.trim() || '',
                user_weight:
                    data.user_weight !== ''
                        ? parseFloat(data.user_weight)
                        : null,
                sleep_score:
                    data.sleep_score !== '' ? parseInt(data.sleep_score) : null,
                sleep_quality: data.sleep_quality.trim() || '',
                notes: data.notes.trim() || '',
                date: data.date || null,
            }

            await updateWorkout(workoutId, updatedFields)
            if (onUpdate) {
                onUpdate(updatedFields)
            }
            setTimeout(() => onClose(), 1500)
        } catch (error) {
            // Error toast is already handled by the store
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <h3 className="text-2xl font-bold text-brand-gold mb-6 text-center tracking-wide">
                Edit Workout
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Workout Name + Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-brand-gold font-semibold mb-1">
                        Workout Name:
                        <input
                            {...register('workout_name')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        />
                    </label>
                    <label className="block text-brand-gold font-semibold mb-1">
                        Workout Date:
                        <input
                            type="date"
                            {...register('date')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        />
                    </label>
                </div>

                {/* User Weight + Sleep Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-brand-gold font-semibold mb-1">
                        User Weight (kg):
                        <input
                            type="number"
                            step="0.1"
                            {...register('user_weight')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        />
                    </label>
                    <label className="block text-brand-gold font-semibold mb-1">
                        Sleep Score (1-100):
                        <input
                            type="number"
                            min="1"
                            max="100"
                            {...register('sleep_score')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        />
                    </label>
                </div>

                {/* Sleep Quality */}
                <label className="block text-brand-gold font-semibold mb-1">
                    Sleep Quality:
                    <textarea
                        {...register('sleep_quality')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        rows="2"
                        placeholder="Describe your sleep quality..."
                    />
                </label>

                {/* Notes */}
                <label className="block text-brand-gold font-semibold mb-1">
                    Notes:
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        rows="2"
                        placeholder="Any workout notes..."
                    />
                </label>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-brand-dark-2 py-2 -mx-2 px-2">
                    <PanelButton type="submit" disabled={isSubmitting} variant="gold" className="flex-1">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </PanelButton>
                    <PanelButton type="button" onClick={onClose} variant="danger" className="flex-1">
                        Cancel
                    </PanelButton>
                </div>
            </form>
        </div>
    )
}

export default WorkoutEditForm
