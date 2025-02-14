import { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'

const WorkoutDetails = ({ workoutId }) => {
    const { accessToken } = useContext(AuthContext)
    const [workout, setWorkout] = useState(null)
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false) // Track updates

    const fetchWorkoutDetails = async () => {
        try {
            const workoutResponse = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            if (!workoutResponse.ok)
                throw new Error('Failed to fetch workout details')

            const workoutData = await workoutResponse.json()
            setWorkout(workoutData)

            const setsResponse = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            if (!setsResponse.ok) throw new Error('Failed to fetch sets')

            const setsData = await setsResponse.json()
            setSets(setsData.sets)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWorkoutDetails()
    }, [accessToken, workoutId, isUpdating])

    const { register, handleSubmit, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alert, setAlert] = useState(null)

    const handleEditClick = () => {
        if (workout) {
            setValue('workout_name', workout.workout_name)
            setValue('user_weight', workout.user_weight || '')
            setValue('sleep_score', workout.sleep_score || '')
            setValue('sleep_quality', workout.sleep_quality || '')
            setValue('notes', workout.notes || '')
            setIsModalOpen(true)
        }
    }

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

            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(updatedFields),
                }
            )

            if (!response.ok) throw new Error('Failed to update workout.')

            const updatedWorkout = await response.json()
            setWorkout(updatedWorkout)
            setIsUpdating(!isUpdating) // Trigger re-fetch of updated details
            setAlert({
                type: 'success',
                message: 'Workout updated successfully!',
            })

            setTimeout(() => {
                setIsModalOpen(false)
                setAlert(null)
            }, 2000)
        } catch (error) {
            setAlert({ type: 'error', message: 'Error updating workout.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <p className="text-white">Loading workout...</p>
    if (error) return <p className="text-red-500">Error: {error}</p>

    return (
        <div className="w-full max-w-4xl bg-[#600000] border border-yellow-400 shadow-lg p-6 text-white rounded-lg">
            <h2 className="text-xl font-bold text-yellow-400">
                {workout?.workout_name}
            </h2>
            <p>
                <strong>Date:</strong>{' '}
                {new Date(workout?.date).toLocaleDateString()}
            </p>
            <p>
                <strong>Notes:</strong> {workout?.notes || 'N/A'}
            </p>

            <button
                onClick={handleEditClick}
                className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition mt-4"
            >
                Edit Workout
            </button>

            {/* Edit Workout Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#600000] text-white p-6 rounded-lg shadow-lg max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
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

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
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
                    </form>
                </DialogContent>
            </Dialog>

            {/* ✅ Restored Sets Table ✅ */}
            <h3 className="text-lg font-semibold text-yellow-400 mt-4">Sets</h3>
            {sets.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                    <table className="w-full border-collapse border border-yellow-400">
                        <thead>
                            <tr className="bg-[#500000] text-yellow-400">
                                <th className="border border-yellow-400 p-2">
                                    Exercise
                                </th>
                                <th className="border border-yellow-400 p-2">
                                    Set Count
                                </th>
                                <th className="border border-yellow-400 p-2">
                                    Set Type
                                </th>
                                <th className="border border-yellow-400 p-2">
                                    Loading
                                </th>
                                <th className="border border-yellow-400 p-2">
                                    Reps
                                </th>
                                <th className="border border-yellow-400 p-2">
                                    Rest (s)
                                </th>
                                <th className="border border-yellow-400 p-2">
                                    Focus
                                </th>
                                <th className="border border-yellow-400 p-2">
                                    Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sets.map((set, index) => (
                                <tr key={index} className="text-white">
                                    <td className="border border-yellow-400 p-2">
                                        {set.exercise_name}
                                    </td>
                                    <td className="border border-yellow-400 p-2 text-center">
                                        {set.set_number}
                                    </td>
                                    <td className="border border-yellow-400 p-2 text-center">
                                        {set.set_type}
                                    </td>
                                    <td className="border border-yellow-400 p-2 text-center">
                                        {set.loading}
                                    </td>
                                    <td className="border border-yellow-400 p-2 text-center">
                                        {set.reps}
                                    </td>
                                    <td className="border border-yellow-400 p-2 text-center">
                                        {set.rest || 'N/A'}
                                    </td>
                                    <td className="border border-yellow-400 p-2">
                                        {set.focus || 'N/A'}
                                    </td>
                                    <td className="border border-yellow-400 p-2">
                                        {set.notes || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No sets available.</p>
            )}
        </div>
    )
}

export default WorkoutDetails
