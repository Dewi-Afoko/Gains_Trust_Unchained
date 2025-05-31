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
        <div className="w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-brand-gold text-center tracking-wide">Edit Set</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Exercise Name + Rest */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-brand-gold font-semibold mb-1">
                            Exercise Name:
                            <input
                                {...register('exercise_name', { required: true })}
                                className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                            />
                        </label>
                    </div>
                    <div>
                        <label className="block text-brand-gold font-semibold mb-1">
                            Rest (seconds):
                            <input
                                type="number"
                                {...register('rest')}
                                className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                            />
                        </label>
                    </div>
                </div>

                {/* Set Type + Focus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-brand-gold font-semibold mb-1">
                        Set Type:
                        <input
                            {...register('set_type')}
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
                </div>

                {/* Loading + Reps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Notes */}
                <label className="block text-brand-gold font-semibold mb-1">
                    Notes:
                    <textarea
                        {...register('notes')}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        rows="2"
                    />
                </label>

                <div className="flex gap-4 justify-center mt-6 sticky bottom-0 bg-brand-dark-2 py-2 -mx-2 px-2">
                    <PanelButton 
                        type="submit" 
                        disabled={isSubmitting} 
                        variant="gold" 
                        className="px-6 py-2 text-lg flex-1"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </PanelButton>
                    <PanelButton 
                        type="button" 
                        onClick={onClose} 
                        variant="danger" 
                        className="px-6 py-2 text-lg flex-1"
                    >
                        Cancel
                    </PanelButton>
                </div>
            </form>
        </div>
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
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4"
            onClick={onClose}
            tabIndex={-1}
            data-testid="set-edit-modal-overlay"
        >
            <div
                className="w-full max-w-lg bg-brand-dark-2/90 backdrop-blur-sm rounded-xl border border-brand-gold/30 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
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
