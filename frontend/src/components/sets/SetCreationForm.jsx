import { useState } from 'react'
import { useForm } from 'react-hook-form'
import useWorkoutStore from '../../stores/workoutStore'
import PanelButton from '../ui/PanelButton'
import { showToast } from '../../utils/toast'

const SetCreationForm = ({ workoutId, onClose, onSetCreated }) => {
    const { createSets } = useWorkoutStore()
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
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
        <div className="w-full max-w-lg mx-auto">
            <h3 className="text-2xl font-bold text-brand-gold mb-6 text-center tracking-wide">Add Set</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Exercise Name + Rest */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
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
                    </div>
                    <div>
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
                    </div>
                </div>

                {/* Set Type + Focus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-brand-gold font-semibold mb-1">
                        Set Type:
                        <input
                            {...register('set_type')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                            placeholder="e.g., Warm-up, Working Set"
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
                </div>

                {/* Loading + Reps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-brand-gold font-semibold mb-1">
                        Loading (kg):
                        <input
                            type="number"
                            step="0.25"
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
                </div>

                {/* Notes */}
                <label className="block text-brand-gold font-semibold mb-1">
                    Notes:
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="Any additional notes..."
                        rows="2"
                    />
                </label>

                {/* Multiple Sets Option */}
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

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-brand-dark-2 py-2 -mx-2 px-2">
                    <PanelButton 
                        type="submit" 
                        variant="gold" 
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : `Add Set${addMultipleSets ? 's' : ''}`}
                    </PanelButton>
                    <PanelButton 
                        type="button" 
                        variant="danger" 
                        className="flex-1" 
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </PanelButton>
                </div>
            </form>
        </div>
    )
}

export default SetCreationForm
