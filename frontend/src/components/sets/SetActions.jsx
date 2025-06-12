import { useState } from 'react'
import { createPortal } from 'react-dom'
import useWorkoutStore from '../../stores/workoutStore'
import SetEditForm from './SetEditForm'
import PanelButton from '../ui/PanelButton'
import { showToast } from '../../utils/toast'

const SetActions = ({ set, hideCompleteButton, hoveredRowId }) => {
    const { workout, toggleSetComplete, duplicateSet, deleteSet } = useWorkoutStore()
    const [editingSetId, setEditingSetId] = useState(null)
    const [deleteModal, setDeleteModal] = useState(false)

    const openEditModal = (setId) => {
        setEditingSetId(setId)
    }

    const closeEditModal = () => {
        setEditingSetId(null)
    }

    const handleDuplicate = async () => {
        if (!workout?.id) {
            showToast('Cannot duplicate set: No active workout', 'error')
            return
        }
        try {
            await duplicateSet(workout.id, set)
            showToast('Set duplicated successfully!', 'success')
        } catch (error) {
            // Error toast is already shown in the store
        }
    }

    const confirmDelete = async () => {
        if (!workout?.id) {
            showToast('Cannot delete set: No active workout', 'error')
            return
        }
        await deleteSet(workout.id, set.id)
        setDeleteModal(false)
    }

    return (
        <div className="flex space-x-2 min-w-[200px]">
            {hoveredRowId === set.id && (
                <div className="flex space-x-2 min-w-[200px] transition-opacity duration-200 opacity-100">
                    <PanelButton onClick={() => openEditModal(set.id)} variant="gold" className="px-3 py-1 w-auto">
                        Edit
                    </PanelButton>
                    <PanelButton onClick={handleDuplicate} variant="gold" className="px-3 py-1 w-auto">
                        Duplicate
                    </PanelButton>
                    <PanelButton onClick={() => setDeleteModal(true)} variant="danger" className="px-3 py-1 w-auto">
                        Delete
                    </PanelButton>
                    {!hideCompleteButton && (
                        <PanelButton onClick={() => toggleSetComplete(set.id)} variant={set.complete ? 'gold' : 'danger'} className="px-3 py-1 w-auto">
                            {set.complete ? '💪🏾' : '⏳'}
                        </PanelButton>
                    )}
                </div>
            )}

            {editingSetId !== null && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
                        <SetEditForm setId={editingSetId} onClose={closeEditModal} />
                    </div>
                </div>,
                document.body
            )}

            {deleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                    <div className="bg-[#600000] p-6 rounded-xl border border-yellow-400 shadow-lg text-white max-w-sm">
                        <h3 className="text-lg font-bold text-yellow-400">
                            Confirm Deletion
                        </h3>
                        <p className="mt-2">
                            Are you sure you want to delete this set? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end mt-4 space-x-3">
                            <PanelButton
                                variant="gold"
                                className="w-auto px-4 py-2"
                                onClick={() => setDeleteModal(false)}
                            >
                                Cancel
                            </PanelButton>
                            <PanelButton
                                variant="danger"
                                className="w-auto px-4 py-2"
                                onClick={confirmDelete}
                            >
                                Delete
                            </PanelButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SetActions
