import { useState } from 'react'
import { useWorkoutContext } from '../../context/WorkoutContext'
import SetEditForm from '../forms/SetEditForm'

const SetActions = ({ set, hideCompleteButton, hoveredRowId }) => {
    const { workout, toggleSetComplete, duplicateSet, deleteSet } =
        useWorkoutContext()
    const [editingSetId, setEditingSetId] = useState(null)
    const [deleteModal, setDeleteModal] = useState(false)

    const openEditModal = (setId) => {
        setEditingSetId(setId)
    }

    const closeEditModal = () => {
        setEditingSetId(null)
    }

    const confirmDelete = async () => {
        if (workout?.id) {
            await deleteSet(workout.id, set.id)
        }
        setDeleteModal(false)
    }

    return (
        <div className="flex space-x-2 min-w-[200px]">
            {hoveredRowId === set.id && (
                <div className="flex space-x-2 min-w-[200px] transition-opacity duration-200 opacity-100">
                    <button
                        onClick={() => openEditModal(set.id)}
                        className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300 transition"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => duplicateSet(workout.id, set)}
                        className="bg-blue-500 text-black px-3 py-1 rounded hover:bg-blue-400 transition"
                    >
                        Duplicate
                    </button>
                    <button
                        onClick={() => setDeleteModal(true)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400 transition"
                    >
                        Delete
                    </button>
                    {!hideCompleteButton && (
                        <button
                            onClick={() => toggleSetComplete(set.id)}
                            className={`px-3 py-1 rounded ${set.complete ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'} transition text-black`}
                        >
                            {set.complete ? '💪🏾' : '⏳'}
                        </button>
                    )}
                </div>
            )}

            {editingSetId !== null && (
                <SetEditForm setId={editingSetId} onClose={closeEditModal} />
            )}
            {deleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-[#600000] p-6 rounded-lg shadow-lg text-white max-w-sm">
                        <h3 className="text-lg font-bold text-yellow-400">
                            Confirm Deletion
                        </h3>
                        <p className="mt-2">
                            Are you sure you want to delete this set? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end mt-4 space-x-3">
                            <button
                                className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-400 transition"
                                onClick={() => setDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 px-4 py-2 rounded hover:bg-red-400 transition"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SetActions
