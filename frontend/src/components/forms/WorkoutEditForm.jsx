import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useWorkoutContext } from '../../context/WorkoutContext'

const WorkoutEditForm = ({ onClose }) => {
    const { workout, updateWorkout } = useWorkoutContext() // ✅ Use updateWorkout from context
    const { register, handleSubmit, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alert, setAlert] = useState(null)

    useEffect(() => {
        if (workout) {
            setValue('workout_name', workout.workout_name || '')
            setValue('user_weight', workout.user_weight || '')
            setValue('sleep_score', workout.sleep_score || '')
            setValue('sleep_quality', workout.sleep_quality || '')
            setValue('notes', workout.notes || '')
            setValue('date', workout.date ? workout.date.split('T')[0] : '') // ✅ Prefill date input
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
                date: data.date || null, // ✅ Ensure date is sent properly
            }

            await updateWorkout(workout.id, updatedFields) // ✅ Use the function from context

            setAlert({
                type: 'success',
                message: 'Workout updated successfully!',
            })
            setTimeout(() => {
                setAlert(null)
                onClose()
            }, 10)
        } catch (error) {
            setAlert({ type: 'error', message: 'Error updating workout.' }) // ✅ Show error only if truly failed
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-[#600000] text-white p-6 rounded-lg shadow-lg max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <h3 className="text-lg font-semibold text-yellow-400">
                Edit Workout
            </h3>
            {alert && (
                <div
                    className={`p-3 mb-4 rounded ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-600'}`}
                >
                    {alert.message}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <label className="block">
                    Workout Name:
                    <input
                        {...register('workout_name')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Workout Date:
                    <input
                        type="date"
                        {...register('date')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    User Weight:
                    <input
                        type="number"
                        {...register('user_weight')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Sleep Score:
                    <input
                        type="number"
                        {...register('sleep_score')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Sleep Quality:
                    <textarea
                        {...register('sleep_quality')}
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
                <button
                    type="submit"
                    className="w-full bg-yellow-400 text-black font-bold p-2 rounded hover:bg-yellow-300"
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    className="w-full bg-gray-500 text-white font-bold p-2 rounded hover:bg-gray-400"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </form>
        </div>
    )
}

export default WorkoutEditForm
