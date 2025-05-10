import { useState } from 'react'
import { useForm } from 'react-hook-form'
import useWorkoutStore from '../../stores/workoutStore'
import PanelButton from '../ui/PanelButton'
import { showToast } from '../../utils/toast'

const SetCreationForm = ({ workoutId, onClose, onSetCreated }) => {
    const { createSets } = useWorkoutStore()
    const { register, handleSubmit, reset, watch, errors } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const addMultipleSets = watch('addMultipleSets')

    const onSubmit = async (data) => {
        if (!workoutId) {
            showToast('Cannot create set: No active workout', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            const formattedData = {
                workout: workoutId,
                exercise_name: data.exercise_name,
                set_type: data.set_type || '',
                loading: data.loading ? parseFloat(data.loading) : null,
                reps: data.reps ? parseInt(data.reps) : null,
                rest: data.rest ? parseInt(data.rest) : null,
                focus: data.focus || '',
                notes: data.notes || '',
            }

            const numberOfSets = addMultipleSets
                ? Math.max(1, parseInt(data.set_count, 10) || 1)
                : 1

            await createSets(workoutId, formattedData, numberOfSets)

            reset()
            if (onSetCreated) {
                onSetCreated()
            }
            onClose()
        } catch (error) {
            console.error('❌ Error adding sets:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-brand-dark-2 text-white p-8 rounded-xl border-2 border-brand-gold shadow-2xl max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] animate-fadeIn">
            <h3 className="text-2xl font-bold text-brand-gold mb-6 text-center tracking-wide">Add Set</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <label className="block text-brand-gold font-semibold mb-1">
                    Exercise Name:
                    <input
                        {...register('exercise_name', { required: 'Exercise name is required' })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="e.g., Bench Press"
                    />
                    {errors.exercise_name && (
                        <p className="mt-1 text-sm text-red-400">{errors.exercise_name.message}</p>
                    )}
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Set Type:
                    <input
                        {...register('set_type')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="e.g., Warm-up, Working Set"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Loading (kg):
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        {...register('loading')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="0.0"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Reps:
                    <input
                        type="number"
                        min="0"
                        {...register('reps')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="0"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Rest (seconds):
                    <input
                        type="number"
                        min="0"
                        {...register('rest')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="60"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Focus:
                    <input
                        {...register('focus')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="e.g., Form, Speed"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Notes:
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="Any additional notes..."
                    />
                </label>

                <label className="flex items-center space-x-2 text-brand-gold font-semibold">
                    <input
                        type="checkbox"
                        {...register('addMultipleSets')}
                        className="text-yellow-400 border-yellow-400 rounded focus:ring-2 focus:ring-yellow-400"
                    />
                    <span>Add multiple sets?</span>
                </label>

                {addMultipleSets && (
                    <label className="block text-brand-gold font-semibold mb-1">
                        Number of Sets:
                        <input
                            type="number"
                            {...register('set_count')}
                            min="1"
                            defaultValue="1"
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        />
                    </label>
                )}

                <div className="flex gap-4 pt-4">
                    <PanelButton type="submit" variant="gold" className="flex-1">
                        Add Set{addMultipleSets ? 's' : ''}
                    </PanelButton>
                    <PanelButton type="button" variant="danger" className="flex-1" onClick={onClose}>
                        Cancel
                    </PanelButton>
                </div>
            </form>
        </div>
    )
}

export default SetCreationForm
