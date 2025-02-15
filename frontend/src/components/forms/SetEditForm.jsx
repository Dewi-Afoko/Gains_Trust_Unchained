import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'

const SetEditForm = ({ workoutId, setId, accessToken, onClose, onUpdate }) => {
    const { register, handleSubmit, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alert, setAlert] = useState(null)

    // Fetch set details for pre-filling the form
    useEffect(() => {
        const fetchSetDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                )

                const setData = response.data.set
                setValue('exercise_name', setData.exercise_name || '')
                setValue('set_type', setData.set_type || '')
                setValue('loading', setData.loading || '')
                setValue('reps', setData.reps || '')
                setValue('rest', setData.rest || '')
                setValue('focus', setData.focus || '')
                setValue('notes', setData.notes || '')
            } catch (error) {
                console.error('❌ Error fetching set details:', error)
                setAlert({
                    type: 'error',
                    message: 'Failed to load set details.',
                })
            }
        }

        fetchSetDetails()
    }, [workoutId, setId, setValue, accessToken])

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            // Convert empty fields to correct values
            const formattedData = {
                exercise_name: data.exercise_name,
                set_type: data.set_type || '',
                loading: data.loading !== '' ? parseFloat(data.loading) : null,
                reps: data.reps !== '' ? parseInt(data.reps) : null,
                rest: data.rest !== '' ? parseInt(data.rest) : null,
                focus: data.focus || '',
                notes: data.notes || '',
            }

            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/`,
                formattedData,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            setAlert({ type: 'success', message: 'Set updated successfully!' })
            onUpdate(response.data.set) // ✅ Update parent state
            setTimeout(() => {
                onClose()
                setAlert(null)
            }, 2000)
        } catch (error) {
            console.error(
                '❌ Error updating set:',
                error.response?.data || error
            )
            setAlert({
                type: 'error',
                message: 'Error updating set. Try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-[#600000] text-white p-6 rounded-lg shadow-lg max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <h3 className="text-lg font-semibold text-yellow-400">Edit Set</h3>

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
                        {...register('exercise_name')}
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
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}

export default SetEditForm
