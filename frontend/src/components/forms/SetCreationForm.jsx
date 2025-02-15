import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'

const SetCreationForm = ({ workoutId, accessToken, onClose, onSetCreated }) => {
    const { register, handleSubmit, reset } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alert, setAlert] = useState(null)

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            // ✅ Ensure empty numeric fields are sent as `null`
            const formattedData = {
                exercise_name: data.exercise_name,
                set_type: data.set_type || '',
                loading: data.loading ? parseFloat(data.loading) : null,
                reps: data.reps ? parseInt(data.reps) : null,
                rest: data.rest ? parseInt(data.rest) : null,
                focus: data.focus || '',
                notes: data.notes || '',
            }

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`,
                formattedData,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            const newSet = response.data.set
            onSetCreated(newSet)
            reset()

            setAlert({ type: 'success', message: 'Set added successfully!' })
            setTimeout(() => {
                onClose()
                setAlert(null)
            }, 2000)
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Error adding set. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-[#600000] text-white p-6 rounded-lg shadow-lg max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <h3 className="text-lg font-semibold text-yellow-400">Add Set</h3>

            {alert && (
                <div
                    className={`text-center p-3 mb-4 rounded ${alert.type === 'success' ? 'bg-green-500 text-black' : 'bg-red-600 text-white'}`}
                >
                    {alert.message}
                </div>
            )}

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

                <button
                    type="submit"
                    className="w-full bg-yellow-400 text-black font-bold p-2 rounded hover:bg-yellow-300"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Add Set'}
                </button>
            </form>
        </div>
    )
}

export default SetCreationForm
