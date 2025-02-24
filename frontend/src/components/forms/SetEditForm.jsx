import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useWorkoutContext } from '../../context/WorkoutContext' // ✅ Use context

const SetEditForm = ({ setId, onClose }) => {
    const { fetchSetDetails, updateSet } = useWorkoutContext(); // ✅ Get functions from context
    const { register, handleSubmit, setValue, reset } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // ✅ Fetch set details and pre-fill fields correctly
    useEffect(() => {
        const loadSetDetails = async () => {
            const setData = await fetchSetDetails(setId);
            if (setData) {
                reset(setData.set); // ✅ Use reset to apply all values at once
            }
        };
        loadSetDetails();
    }, [setId, reset]);

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

            await updateSet(setId, formattedData); // ✅ Use function from context

            setTimeout(() => {
                onClose();
            }, 100);
        } catch (error) {
            console.error('❌ Error updating set:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#600000] text-white p-6 rounded-lg shadow-lg max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <h3 className="text-lg font-semibold text-yellow-400">Edit Set</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <label className="block">Exercise Name:<input {...register('exercise_name')} className="w-full p-2 mt-1 rounded text-black" /></label>
                <label className="block">Set Type:<input {...register('set_type')} className="w-full p-2 mt-1 rounded text-black" /></label>
                <label className="block">Loading (kg):<input type="number" step="0.1" {...register('loading')} className="w-full p-2 mt-1 rounded text-black" /></label>
                <label className="block">Reps:<input type="number" {...register('reps')} className="w-full p-2 mt-1 rounded text-black" /></label>
                <label className="block">Rest (seconds):<input type="number" {...register('rest')} className="w-full p-2 mt-1 rounded text-black" /></label>
                <label className="block">Focus:<input {...register('focus')} className="w-full p-2 mt-1 rounded text-black" /></label>
                <label className="block">Notes:<textarea {...register('notes')} className="w-full p-2 mt-1 rounded text-black" /></label>

                <button type="submit" className="w-full bg-yellow-400 text-black font-bold p-2 rounded hover:bg-yellow-300" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="w-full bg-gray-500 text-white font-bold p-2 rounded hover:bg-gray-400" onClick={onClose}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default SetEditForm;
