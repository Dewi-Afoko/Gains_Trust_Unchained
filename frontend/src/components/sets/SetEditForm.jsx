import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useWorkoutContext } from '../../providers/WorkoutContext'
import PanelButton from '../ui/PanelButton'

const SetEditForm = ({ setId, onClose }) => {
    const { fetchSetDetails, updateSet } = useWorkoutContext()
    const { register, handleSubmit, reset } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const loadSetDetails = async () => {
            const setData = await fetchSetDetails(setId)
            if (setData) {
                reset(setData?.set || {}) // ✅ Fix: Ensure reset is correctly applied
            }
        }
        loadSetDetails()
    }, [setId, reset])

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const formattedData = {
                exercise_name: data.exercise_name,
                set_type: data.set_type || '',
                loading: data.loading !== '' ? parseFloat(data.loading) : null,
                reps: data.reps !== '' ? parseInt(data.reps) : null,
                rest: data.rest !== '' ? parseInt(data.rest) : null,
                focus: data.focus || '',
                notes: data.notes || '',
            }

            await updateSet(setId, formattedData)
            setTimeout(() => {
                onClose()
            }, 100)
        } catch (error) {
            console.error('❌ Error updating set:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-[#600000] text-white p-6 rounded-lg shadow-lg w-full max-w-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <h3 className="text-lg font-semibold text-yellow-400">Edit Set</h3>

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

                <PanelButton type="submit" disabled={isSubmitting} variant="gold" className="">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </PanelButton>
                <PanelButton type="button" onClick={onClose} variant="danger" className="">
                    Cancel
                </PanelButton>
            </form>
        </div>
    )
}

export default SetEditForm
