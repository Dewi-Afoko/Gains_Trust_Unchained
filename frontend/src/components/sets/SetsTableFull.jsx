import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import SetActions from './SetActions'
import axios from 'axios'

const SetsTableFull = ({ sets, workoutId, accessToken, updateSingleSet }) => {
    const toggleComplete = async (setId, currentState) => {
        try {
            console.log(`📡 Toggling complete status for set ${setId}...`)
            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/`,
                { complete: !currentState },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            console.log('✅ Set completion updated:', response.data)
            updateSingleSet(response.data.set) // ✅ Update only the modified set
        } catch (error) {
            console.error('❌ Error updating set:', error)
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
                    onClick={() => toggleComplete(row.original.id, row.original.complete)}
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
                <div className="flex flex-wrap gap-2 justify-center min-w-fit">
                    <SetActions
                        set={row.original}
                        workoutId={workoutId}
                        accessToken={accessToken}
                        updateSingleSet={updateSingleSet} // ✅ Fix: Pass function correctly
                    />
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
                                    {cell.column.columnDef.cell
                                        ? cell.column.columnDef.cell(cell.getContext())
                                        : cell.getValue()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SetsTableFull
