import { useEffect, useState } from 'react';
import { useWorkoutContext } from '../../context/WorkoutContext'; // ✅ Use WorkoutContext
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import SetActions from './SetActions';

const SetsTableFull = ({ hideCompleteButton = false }) => {
    const { sets, updateSingleSet, toggleSetComplete, workout } = useWorkoutContext(); // ✅ Get data from context
    const [tableData, setTableData] = useState(sets);
    const [editingSetId, setEditingSetId] = useState(null); // ✅ Track which set is being edited

    // ✅ Ensure table data updates dynamically when `sets` change
    useEffect(() => {
        console.log('🔄 Updating table data with new sets state...');
        setTableData([...sets]); // ✅ Force new reference to trigger React Table update
    }, [sets]);

    const openEditModal = (setId) => {
        setEditingSetId(setId); // ✅ Ensure `setId` is set before opening modal
    };

    const closeEditModal = () => {
        setEditingSetId(null);
    };

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
                    onClick={() => toggleSetComplete(row.original.id, row.original.complete)}
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
                        hideCompleteButton={hideCompleteButton}
                        onEdit={() => openEditModal(row.original.id)} // ✅ Ensure `setId` is passed
                    />
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto mt-4">
            <table key={tableData.length} className="w-full border-collapse border border-yellow-400">
                <thead>
                    <tr className="bg-[#500000] text-yellow-400">
                        {columns.map((col) => (
                            <th key={col.accessorKey} className="border border-yellow-400 p-2">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="text-white">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="border border-yellow-400 p-2">
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
    );
};

export default SetsTableFull;
