import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import useWorkoutStore from '../../stores/workoutStore'
import PanelButton from '../ui/PanelButton'
import { createPortal } from 'react-dom'

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
        <>
            <h2 className="text-2xl font-bold mb-6 text-brand-gold text-center tracking-wide">Edit Set</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <label className="block text-brand-gold font-semibold mb-1">
                    Exercise Name:
                    <input
                        {...register('exercise_name', { required: true })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Set Type:
                    <input
                        {...register('set_type')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Loading (kg):
                    <input
                        type="number"
                        step="0.5"
                        {...register('loading')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Reps:
                    <input
                        type="number"
                        {...register('reps')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Rest (seconds):
                    <input
                        type="number"
                        {...register('rest')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Focus:
                    <input
                        {...register('focus')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                    />
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Notes:
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                    />
                </label>

                <div className="flex gap-4 justify-center mt-6">
                    <PanelButton type="submit" disabled={isSubmitting} variant="gold" className="px-6 py-2 text-lg">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </PanelButton>
                    <PanelButton type="button" onClick={onClose} variant="danger" className="px-6 py-2 text-lg">
                        Cancel
                    </PanelButton>
                </div>
            </form>
        </>
    )
}

// Modal wrapper for SetEditForm
export function SetEditModal({ setId, open, onClose }) {
    // Close on escape key
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;
    return createPortal(
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            tabIndex={-1}
            data-testid="set-edit-modal-overlay"
        >
            <div
                className="w-full max-w-3xl mx-auto bg-[#2d2d2d] rounded-xl border-2 border-yellow-400 shadow-2xl p-8 relative"
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
                data-testid="set-edit-modal-content"
            >
                <SetEditForm setId={setId} onClose={onClose} />
            </div>
        </div>,
        document.body
    )
}

export default SetEditForm
