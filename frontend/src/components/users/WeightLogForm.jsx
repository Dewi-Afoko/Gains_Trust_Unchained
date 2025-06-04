import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { showToast } from '../../utils/toast'
import { addWeight } from '../../api/usersApi'
import PanelButton from '../ui/PanelButton'

const WeightLogForm = ({ onClose, onUpdate }) => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const weightData = {
                weight: parseFloat(data.weight)
            }

            const newWeight = await addWeight(weightData)
            onUpdate(newWeight) // Notify parent to refresh weight data
            
            showToast('Weight logged successfully!', 'success')
            setTimeout(() => {
                onClose()
            }, 1500)
        } catch (error) {
            showToast('Error logging weight. Please try again.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <h3 className="text-2xl font-bold text-brand-gold mb-6 text-center tracking-wide">
                Log Weight
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Weight Input */}
                <div className="space-y-4">
                    <label className="block text-brand-gold font-semibold mb-1">
                        Weight (kg):
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="500"
                            {...register('weight', { 
                                required: 'Weight is required',
                                min: { value: 0, message: 'Weight must be positive' },
                                max: { value: 500, message: 'Weight must be less than 500kg' }
                            })}
                            className="w-full p-3 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition text-lg text-center"
                            placeholder="Enter your current weight"
                            autoFocus
                        />
                        {errors.weight && (
                            <p className="mt-1 text-sm text-red-400">
                                {errors.weight.message}
                            </p>
                        )}
                    </label>

                    {/* Current Date Display */}
                    <div className="text-center p-3 bg-black/30 rounded-lg border border-brand-gold/30">
                        <span className="text-brand-gold/70 text-sm font-semibold uppercase tracking-wider">
                            Date to be recorded
                        </span>
                        <div className="text-white font-medium mt-1">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-brand-dark-2 py-2 -mx-2 px-2">
                    <PanelButton 
                        type="submit" 
                        disabled={isSubmitting} 
                        variant="gold" 
                        className="flex-1"
                    >
                        {isSubmitting ? 'Logging...' : 'Log Weight'}
                    </PanelButton>
                    <PanelButton 
                        type="button" 
                        onClick={onClose} 
                        variant="danger" 
                        className="flex-1"
                    >
                        Cancel
                    </PanelButton>
                </div>
            </form>
        </div>
    )
}

export default WeightLogForm 