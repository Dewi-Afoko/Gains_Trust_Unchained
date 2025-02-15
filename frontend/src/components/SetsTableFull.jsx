import { useState } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table'
import SetEditForm from './forms/SetEditForm'

const SetsTableFull = ({ sets, workoutId, accessToken, onSetUpdated }) => {
    const [editingSetId, setEditingSetId] = useState(null)

    // Open the edit form modal for a specific set
    const openEditModal = (setId) => {
        setEditingSetId(setId)
    }

    // Close the modal after saving
    const closeEditModal = () => {
        setEditingSetId(null)
    }

    const columns = [
        { accessorKey: 'exercise_name', header: 'Exercise' },
        { accessorKey: 'set_type', header: 'Set Type' },
        { accessorKey: 'loading', header: 'Loading (kg)' },
        { accessorKey: 'reps', header: 'Reps' },
        { accessorKey: 'rest', header: 'Rest (s)' },
        { accessorKey: 'focus', header: 'Focus' },
        { accessorKey: 'notes', header: 'Notes' },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <button
                    onClick={() => openEditModal(row.original.id)}
                    className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300 transition"
                >
                    Edit
                </button>
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

            {/* Modal for Editing Set */}
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
