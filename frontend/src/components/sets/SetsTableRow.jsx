import { flexRender } from '@tanstack/react-table'
import SetActions from './SetActions'

const SetsTableRow = ({ row, workoutId, accessToken, onSetUpdated }) => {
    return (
        <tr className="text-white">
            {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-yellow-400 p-2">
                    {cell.column.columnDef.accessorKey === 'actions' ? (
                        <SetActions
                            set={row.original}
                            workoutId={workoutId}
                            accessToken={accessToken}
                            onSetUpdated={onSetUpdated}
                        />
                    ) : (
                        flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )
                    )}
                </td>
            ))}
        </tr>
    )
}

export default SetsTableRow
