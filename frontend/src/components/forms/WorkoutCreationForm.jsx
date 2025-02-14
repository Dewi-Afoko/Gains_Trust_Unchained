import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useContext } from 'react'
import AuthContext from '../../context/AuthContext'

const WorkoutCreationForm = ({ onClose, setIsCreating, setIsSubmitted }) => {
    const { accessToken } = useContext(AuthContext)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        setIsCreating(true) // Show "Creating workout..." card
        try {
            const requestData = {}

            if (data.workout_name) requestData.workout_name = data.workout_name
            if (data.user_weight) requestData.user_weight = data.user_weight
            if (data.sleep_score) requestData.sleep_score = data.sleep_score
            if (data.sleep_quality)
                requestData.sleep_quality = data.sleep_quality
            if (data.notes) requestData.notes = data.notes

            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestData),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to create workout')
            }

            const createdWorkout = await response.json()
            console.log('Workout Created:', createdWorkout)

            setIsSubmitted(true) // Mark submission as successful

            setTimeout(() => {
                window.location.reload() // Refresh the page after 3 seconds
            }, 3000) // 3 seconds

            onClose() // Close the modal after success
        } catch (error) {
            setError(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-md bg-[#600000] border border-yellow-400 shadow-lg p-6 text-white rounded-lg">
            <h2 className="text-xl font-bold text-yellow-400">
                Create New Workout
            </h2>
            {error && <p className="text-red-500">{error}</p>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-white">Workout Name</label>
                    <input
                        {...register('workout_name', {
                            required: 'Workout name is required',
                        })}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                    {errors.workout_name && (
                        <p className="text-red-400">
                            {errors.workout_name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-white">User Weight (kg)</label>
                    <input
                        type="number"
                        {...register('user_weight')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </div>

                <div>
                    <label className="block text-white">Sleep Score</label>
                    <input
                        type="number"
                        {...register('sleep_score', { valueAsNumber: true })}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </div>

                <div>
                    <label className="block text-white">Sleep Quality</label>
                    <textarea
                        {...register('sleep_quality')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </div>

                <div>
                    <label className="block text-white">Notes</label>
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </div>

                <div className="mt-4 flex justify-between">
                    <button
                        type="submit"
                        className="bg-yellow-400 text-black font-bold p-2 rounded hover:bg-yellow-300"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Workout'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-red-400 text-black font-bold p-2 rounded hover:bg-red-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default WorkoutCreationForm
