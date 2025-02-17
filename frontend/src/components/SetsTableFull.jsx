import { useState } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table'
import axios from 'axios'
import SetEditForm from './forms/SetEditForm'

const SetsTableFull = ({ sets, workoutId, accessToken, onSetUpdated }) => {
    const [editingSetId, setEditingSetId] = useState(null)

    // ✅ Open the edit form modal for a specific set
    const openEditModal = (setId) => {
        setEditingSetId(setId)
    }

    // ✅ Close the modal after saving
    const closeEditModal = () => {
        setEditingSetId(null)
    }

    // ✅ Toggle Set Completion
    const toggleComplete = async (setId, currentState) => {
        try {
            console.log(`📡 Toggling complete status for set ${setId}...`)

            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/`,
                { complete: !currentState },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            console.log('✅ Set completion updated:', response.data)

            // ✅ Update state after toggling complete
            if (onSetUpdated) {
                onSetUpdated(response.data.set)
            }
        } catch (error) {
            console.error('❌ Error updating set:', error)
        }
    }

    // ✅ Duplicate Set Functionality
    const duplicateSet = async (set) => {
        try {
            console.log(`📡 Duplicating set ${set.id}...`)

            // Prepare the new set data (excluding complete, set_order, and set_number)
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

            if (onSetUpdated) {
                onSetUpdated(response.data.set)
            }
        } catch (error) {
            console.error('❌ Error duplicating set:', error)
        }
    }

    // ✅ Delete Set Functionality
    const deleteSet = async (setId) => {
        try {
            console.log(`📡 Deleting set ${setId}...`)

            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            console.log('✅ Set deleted successfully.')

            if (onSetUpdated) {
                onSetUpdated() // ✅ Trigger a re-fetch
            }
        } catch (error) {
            console.error('❌ Error deleting set:', error)
        }
    }

    const columns = [
        { accessorKey: 'exercise_name', header: 'Exercise' },
        { accessorKey: 'set_order', header: 'Set Sequence' },
        { accessorKey: 'set_number', header: 'Set Count' },
        { accessorKey: 'set_type', header: 'Set Type' },
        { accessorKey: 'loading', header: 'Loading (kg)' },
        { accessorKey: 'reps', header: 'Reps' },
        { accessorKey: 'rest', header: 'Rest (s)' },
        { accessorKey: 'focus', header: 'Focus' },
        { accessorKey: 'notes', header: 'Notes' },
        {
            accessorKey: 'complete',
            header: 'Complete',
            cell: ({ row }) => (
                <button
                    onClick={() =>
                        toggleComplete(row.original.id, row.original.complete)
                    }
                    className={`px-3 py-1 rounded ${
                        row.original.complete
                            ? 'bg-green-500 hover:bg-green-400'
                            : 'bg-red-500 hover:bg-red-400'
                    } transition text-black`}
                >
                    {row.original.complete ? '💪🏾' : '⏳'}
                </button>
            ),
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex space-x-2 min-w-[200px]">
                    <button
                        onClick={() => openEditModal(row.original.id)}
                        className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300 transition"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => duplicateSet(row.original)}
                        className="bg-blue-500 text-black px-3 py-1 rounded hover:bg-blue-400 transition"
                    >
                        Duplicate
                    </button>
                    <button
                        onClick={() => deleteSet(row.original.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400 transition"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data: sets,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse border border-yellow-400">
                <thead>
                    <tr className="bg-[#500000] text-yellow-400">
                        {columns.map((col) => (
                            <th
                                key={col.accessorKey}
                                className="border border-yellow-400 p-2"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="text-white">
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="border border-yellow-400 p-2"
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ Modal for Editing Set */}
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

export default SetsTableFull
