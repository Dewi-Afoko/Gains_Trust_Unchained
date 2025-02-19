import { useState } from 'react'
import axios from 'axios'
import SetEditForm from '../forms/SetEditForm'

const SetActions = ({ set, workoutId, accessToken, onSetUpdated }) => {
    const [editingSetId, setEditingSetId] = useState(null)

    const openEditModal = () => setEditingSetId(set.id)
    const closeEditModal = () => setEditingSetId(null)

    const toggleComplete = async () => {
        try {
            console.log(`📡 Toggling complete status for set ${set.id}...`)
            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${set.id}/`,
                { complete: !set.complete },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            console.log('✅ Set completion updated:', response.data)
            onSetUpdated(response.data.set)
        } catch (error) {
            console.error('❌ Error updating set:', error)
        }
    }

    const duplicateSet = async () => {
        try {
            console.log(`📡 Duplicating set ${set.id}...`)
            const newSetData = {
                exercise_name: set.exercise_name,
                set_type: set.set_type || '',
                loading: set.loading ? parseFloat(set.loading) : null,
                reps: set.reps ? parseInt(set.reps) : null,
                rest: set.rest ? parseInt(set.rest) : null,
                focus: set.focus || '',
                notes: set.notes || '',
            }

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/`,
                newSetData,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            console.log('✅ Set duplicated successfully:', response.data.set)
            onSetUpdated(response.data.set)
        } catch (error) {
            console.error('❌ Error duplicating set:', error)
        }
    }

    const deleteSet = async () => {
        try {
            console.log(`📡 Deleting set ${set.id}...`)
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${set.id}/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            console.log('✅ Set deleted successfully.')
            onSetUpdated()
        } catch (error) {
            console.error('❌ Error deleting set:', error)
        }
    }

    return (
        <div className="flex space-x-2 min-w-[200px]">
            <button
                onClick={openEditModal}
                className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300 transition"
            >
                Edit
            </button>
            <button
                onClick={duplicateSet}
                className="bg-blue-500 text-black px-3 py-1 rounded hover:bg-blue-400 transition"
            >
                Duplicate
            </button>
            <button
                onClick={deleteSet}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400 transition"
            >
                Delete
            </button>

            {editingSetId && (
                <SetEditForm
                    workoutId={workoutId}
                    setId={editingSetId}
                    accessToken={accessToken}
                    onClose={closeEditModal}
                    onUpdate={onSetUpdated}
                />
            )}
        </div>
    )
}

export default SetActions
