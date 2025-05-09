import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import useWorkoutStore from '../../stores/workoutStore'
import PanelButton from '../ui/PanelButton'

const SetEditForm = ({ setId, onClose }) => {
    const { sets, updateSet } = useWorkoutStore()
    const { register, handleSubmit, reset } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Find the set data from the store
    const setData = sets.find(set => set.id === setId)

    useEffect(() => {
        if (setData) {
            reset({
                exercise_name: setData.exercise_name,
                set_type: setData.set_type || '',
                loading: setData.loading || '',
                reps: setData.reps || '',
                rest: setData.rest || '',
                focus: setData.focus || '',
                notes: setData.notes || '',
            })
        }
    }, [setData, reset])

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

            await updateSet(setId, formattedData)
            onClose()
        } catch (error) {
            console.error('Error updating set:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!setData) {
        return <div>Loading...</div>
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-brand-gold">Edit Set</h2>
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
                        step="0.5"
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
