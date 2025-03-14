import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useWorkoutContext } from '../../context/WorkoutContext'

const SetCreationForm = ({ onClose }) => {
    const { workout, createSets } = useWorkoutContext() // ✅ Use createSets from context
    const { register, handleSubmit, reset, watch } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const addMultipleSets = watch('addMultipleSets') // ✅ Track checkbox state

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const formattedData = {
                exercise_name: data.exercise_name,
                set_type: data.set_type || '',
                loading: data.loading ? parseFloat(data.loading) : null,
                reps: data.reps ? parseInt(data.reps) : null,
                rest: data.rest ? parseInt(data.rest) : null,
                focus: data.focus || '',
                notes: data.notes || '',
            }

            const numberOfSets = addMultipleSets
                ? parseInt(data.set_count, 10)
                : 1 // ✅ Default to 1 if unchecked

            await createSets(workout.id, formattedData, numberOfSets) // ✅ Use the function from context

            reset()
            setTimeout(onClose, 10)
        } catch (error) {
            console.error('❌ Error adding sets:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-[#600000] text-white p-6 rounded-lg shadow-lg max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <h3 className="text-lg font-semibold text-yellow-400">Add Set</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <label className="block">
                    Exercise Name:
                    <input
                        {...register('exercise_name', { required: true })}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Set Type:
                    <input
                        {...register('set_type')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Loading (kg):
                    <input
                        type="number"
                        step="0.1"
                        {...register('loading')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Reps:
                    <input
                        type="number"
                        {...register('reps')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Rest (seconds):
                    <input
                        type="number"
                        {...register('rest')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Focus:
                    <input
                        {...register('focus')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Notes:
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>

                {/* ✅ New Checkbox for Adding Multiple Sets */}
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        {...register('addMultipleSets')}
                        className="text-yellow-400"
                    />
                    <span>Add multiple sets?</span>
                </label>

                {/* ✅ If checkbox is checked, show the number input */}
                {addMultipleSets && (
                    <label className="block">
                        Number of Sets:
                        <input
                            type="number"
                            {...register('set_count')}
                            min="1"
                            defaultValue="1"
                            className="w-full p-2 mt-1 rounded text-black"
                        />
                    </label>
                )}

                <button
                    type="submit"
                    className="w-full bg-yellow-400 text-black font-bold p-2 rounded hover:bg-yellow-300"
                >
                    {isSubmitting ? 'Saving...' : 'Add Set(s)'}
                </button>
                <button
                    type="button"
                    className="w-full bg-gray-500 text-white font-bold p-2 rounded hover:bg-gray-400 mt-2"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </form>
        </div>
    )
}

export default SetCreationForm
