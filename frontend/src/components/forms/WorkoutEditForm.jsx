import { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'

const WorkoutEditForm = ({
    workout,
    workoutId,
    accessToken,
    onClose,
    onUpdate,
}) => {
    const { register, handleSubmit, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alert, setAlert] = useState(null)

    // ✅ Auto-populate form fields when the component mounts
    useEffect(() => {
        if (workout) {
            setValue('workout_name', workout.workout_name || '')
            setValue('user_weight', workout.user_weight || '')
            setValue('sleep_score', workout.sleep_score || '')
            setValue('sleep_quality', workout.sleep_quality || '')
            setValue('notes', workout.notes || '')
        }
    }, [workout, setValue])

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const updatedFields = {}

            if (data.workout_name !== workout.workout_name) {
                updatedFields.workout_name =
                    data.workout_name.trim() !== ''
                        ? data.workout_name.trim()
                        : ''
            }
            if (data.user_weight !== workout.user_weight) {
                updatedFields.user_weight =
                    data.user_weight !== ''
                        ? parseFloat(data.user_weight)
                        : null
            }
            if (data.sleep_score !== workout.sleep_score) {
                updatedFields.sleep_score =
                    data.sleep_score !== '' ? parseInt(data.sleep_score) : null
            }
            if (data.sleep_quality !== workout.sleep_quality) {
                updatedFields.sleep_quality =
                    data.sleep_quality.trim() !== ''
                        ? data.sleep_quality.trim()
                        : ''
            }
            if (data.notes !== workout.notes) {
                updatedFields.notes =
                    data.notes.trim() !== '' ? data.notes.trim() : ''
            }

            if (Object.keys(updatedFields).length === 0) {
                setAlert({ type: 'warning', message: 'No changes detected.' })
                setIsSubmitting(false)
                return
            }

            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                updatedFields,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            onUpdate(response.data)
            setAlert({
                type: 'success',
                message: 'Workout updated successfully!',
            })

            setTimeout(() => {
                onClose()
                setAlert(null)
            }, 2000)
        } catch (error) {
            setAlert({ type: 'error', message: 'Error updating workout.' })
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
                    className={`text-center p-3 mb-4 rounded ${alert.type === 'success' ? 'bg-green-500 text-black' : 'bg-red-600 text-white'}`}
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
                    User Weight (kg):
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
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    className="w-full bg-gray-500 text-white font-bold p-2 rounded hover:bg-gray-400"
                    onClick={onClose} // ✅ Close modal without saving
                >
                    Cancel
                </button>
            </form>
        </div>
    )
}

export default WorkoutEditForm
