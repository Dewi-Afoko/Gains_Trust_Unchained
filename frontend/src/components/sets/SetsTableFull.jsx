import { useEffect, useState } from 'react'
import { useWorkoutContext } from '../../context/WorkoutContext' // ✅ Use WorkoutContext
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import SetActions from './SetActions'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'

const SetsTableFull = ({ sets: propSets, hideCompleteButton = true }) => {
    // ✅ Use context functions and state
    const {
        sets: contextSets,
        toggleSetComplete,
        moveSet,
    } = useWorkoutContext()
    const [tableData, setTableData] = useState(propSets || contextSets)
    const [editingSetId, setEditingSetId] = useState(null)
    const [hoveredRowId, setHoveredRowId] = useState(null)

    // ✅ Ensure table data updates dynamically when `sets` change
    useEffect(() => {
        setTableData([...(propSets || contextSets)]) // ✅ Forces re-render
        console.log(
            '📊 Context sets updated:',
            contextSets.map((s) => ({ id: s.id, order: s.set_order }))
        )
    }, [propSets, contextSets])

    const openEditModal = (setId) => {
        setEditingSetId(setId) // ✅ Ensure `setId` is set before opening modal
    }

    const columns = [
        { accessorKey: 'exercise_name', header: 'Exercise' },
        {
            accessorKey: 'set_order',
            header: 'Set Sequence',
            cell: ({ row }) => {
                const set = row.original
                return (
                    <div className="flex items-center gap-2">
                        <PanelButton
                            onClick={() => moveSet(set.id, set.set_order - 1)}
                            disabled={set.set_order === 1}
                            className="bg-gray-700 hover:bg-gray-800 disabled:opacity-50 w-auto px-2 py-1 text-sm"
                        >
                            ⬆
                        </PanelButton>

                        <span>{set.set_order}</span>

                        <PanelButton
                            onClick={() => moveSet(set.id, set.set_order + 1)}
                            disabled={set.set_order === contextSets.length}
                            className="bg-gray-700 hover:bg-gray-800 disabled:opacity-50 w-auto px-2 py-1 text-sm"
                        >
                            ⬇
                        </PanelButton>
                    </div>
                )
            },
        },
        { accessorKey: 'set_number', header: 'Set Count' },
        { accessorKey: 'set_type', header: 'Set Type' },
        {
            accessorKey: 'loading',
            header: 'Loading',
            cell: ({ row }) => formatLoading(row.original.loading),
        },
        { accessorKey: 'reps', header: 'Reps' },
        { accessorKey: 'rest', header: 'Rest (s)' },
        { accessorKey: 'focus', header: 'Focus' },
        { accessorKey: 'notes', header: 'Notes' },
        {
            accessorKey: 'complete',
            header: 'Complete',
            cell: ({ row }) => (
                <PanelButton
                    onClick={() =>
                        toggleSetComplete(
                            row.original.id,
                            row.original.complete
                        )
                    }
                    className={`w-auto px-3 py-1 text-sm ${row.original.complete ? 'bg-green-600 hover:bg-green-700 text-black' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                    {row.original.complete ? '💪🏾' : '⏳'}
                </PanelButton>
            ),
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2 justify-center min-w-fit">
                    <SetActions
                        set={row.original}
                        hideCompleteButton={hideCompleteButton}
                        onEdit={() => openEditModal(row.original.id)}
                        hoveredRowId={hoveredRowId}
                    />
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="overflow-x-auto mt-4">
            <table
                key={tableData.length}
                className="w-full border-collapse border border-yellow-400"
            >
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
                        <tr
                            key={row.id}
                            className="text-white"
                            onMouseEnter={() =>
                                setHoveredRowId(row.original.id)
                            }
                            onMouseLeave={() => setHoveredRowId(null)}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="border border-yellow-400 p-2"
                                >
                                    {cell.column.columnDef.cell
                                        ? cell.column.columnDef.cell(
                                              cell.getContext()
                                          )
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
