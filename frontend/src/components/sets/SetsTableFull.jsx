import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import useWorkoutStore from '../../stores/workoutStore'
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'
import { ChevronUp, ChevronDown, CheckCircle2, Clock, GripVertical } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import RadialMenuPopover from '../ui/RadialMenuPopover'
import SetEditForm from './SetEditForm'
import texture2 from '../../assets/texture2.png'
import { moveSet as moveSetApi } from '../../api/setsApi'

const TableHeader = ({ children }) => (
    <th className="border-b border-r border-brand-gold/30 p-3 first:border-l text-center">
        <div className="font-bold uppercase tracking-wider text-sm bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
            {children}
        </div>
    </th>
)

const TableCell = ({ children, className = '' }) => (
    <td
        className={`border-b border-r border-brand-gold/30 p-3 first:border-l text-center ${className}`}
    >
        <span className="text-gray-300 font-medium">{children}</span>
    </td>
)

const SetsTableFull = ({ sets: propSets, hideCompleteButton = true }) => {
    const { sets: storeSets, toggleSetComplete, moveSet } = useWorkoutStore()
    const [tableData, setTableData] = useState(propSets || storeSets)
    const [editingSetId, setEditingSetId] = useState(null)
    const [activeSetId, setActiveSetId] = useState(null)
    const [draggedSet, setDraggedSet] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)

    useEffect(() => {
        setTableData([...(propSets || storeSets)])
    }, [propSets, storeSets])

    const handleEdit = (setId) => {
        setEditingSetId(setId)
        setActiveSetId(null)
    }

    const closeEditModal = () => {
        setEditingSetId(null)
    }

    const handleDragStart = (e, set, index) => {
        setDraggedSet({ set, index })
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', e.target)
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverIndex(index)
    }

    const handleDragLeave = (e) => {
        // Only clear drag over if we're leaving the row entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverIndex(null)
        }
    }

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault()
        setDragOverIndex(null)
        
        if (!draggedSet || draggedSet.index === dropIndex) {
            setDraggedSet(null)
            return
        }

        const draggedSetData = draggedSet.set
        const newPosition = dropIndex + 1 // API expects 1-based positions
        
        try {
            // Call the API to move the set
            await moveSetApi(draggedSetData.id, newPosition)
            
            // Update local state through the store
            moveSet(draggedSetData.id, newPosition)
        } catch (error) {
            console.error('Failed to move set:', error)
            // You might want to show a toast notification here
        }
        
        setDraggedSet(null)
    }

    const handleDragEnd = () => {
        setDraggedSet(null)
        setDragOverIndex(null)
    }

    if (!tableData || tableData.length === 0) {
        return (
            <div className="w-full relative min-h-[200px] overflow-hidden rounded-xl">
                {/* Background Texture */}
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none z-0 rounded-xl"
                    style={{
                        backgroundImage: `url(${texture2})`,
                        backgroundSize: '500px 500px',
                        backgroundRepeat: 'repeat',
                        backgroundAttachment: 'scroll',
                        backgroundPosition: 'center center',
                    }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 rounded-xl z-10"></div>

                {/* Content */}
                <div className="relative z-20 text-center py-8 text-gray-400 flex items-center justify-center h-full">
                    <span className="font-medium uppercase tracking-wider">
                        No sets added yet. Click &quot;Add Set&quot; to get
                        started!
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full rounded-xl border border-brand-gold/30 relative overflow-hidden">
            {/* Background Texture */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none z-0"
                style={{
                    backgroundImage: `url(${texture2})`,
                    backgroundSize: '500px 500px',
                    backgroundRepeat: 'repeat',
                    backgroundAttachment: 'scroll',
                    backgroundPosition: 'center center',
                }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 z-10"></div>

            {/* Content */}
            <div className="relative z-20">
                {/* Responsive table container */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e]">
                                <TableHeader>Drag</TableHeader>
                                <TableHeader>Exercise</TableHeader>
                                <TableHeader>Order</TableHeader>
                                <TableHeader>Set #</TableHeader>
                                <TableHeader>Type</TableHeader>
                                <TableHeader>Weight</TableHeader>
                                <TableHeader>Reps</TableHeader>
                                <TableHeader>Rest</TableHeader>
                                <TableHeader>Focus</TableHeader>
                                <TableHeader>Notes</TableHeader>
                                <TableHeader>Status</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((set, index) => (
                                <>
                                    {/* Drop zone indicator */}
                                    {draggedSet && dragOverIndex === index && draggedSet.index !== index && (
                                        <tr>
                                            <td colSpan="11" className="p-0">
                                                <div className="h-1 bg-brand-gold/60 border-t-2 border-brand-gold"></div>
                                            </td>
                                        </tr>
                                    )}
                                    <Popover.Root
                                        key={set.id}
                                        open={activeSetId === set.id}
                                        onOpenChange={(open) => {
                                            if (!open) setActiveSetId(null)
                                        }}
                                    >
                                        <Popover.Trigger asChild>
                                            <tr
                                                className={`
                                                    relative
                                                    transition-colors duration-150
                                                    hover:bg-black/40
                                                    cursor-pointer
                                                    ${index % 2 === 0 ? 'bg-black/20' : 'bg-black/10'}
                                                    ${dragOverIndex === index ? 'bg-brand-gold/20 border-brand-gold/50' : ''}
                                                    ${draggedSet?.index === index ? 'opacity-50' : ''}
                                                `}
                                                style={{ height: '48px' }}
                                                onClick={() =>
                                                    setActiveSetId(set.id)
                                                }
                                                draggable="true"
                                                onDragStart={(e) => handleDragStart(e, set, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <TableCell>
                                                    <div 
                                                        className="flex items-center justify-center cursor-move"
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <GripVertical className="w-4 h-4 text-brand-gold/70 hover:text-brand-gold transition-colors" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {set.exercise_name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 justify-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                moveSet(
                                                                    set.id,
                                                                    set.set_order -
                                                                        1
                                                                )
                                                            }}
                                                            disabled={
                                                                set.set_order === 1
                                                            }
                                                            className="bg-gray-700/80 hover:bg-gray-600/80 disabled:opacity-50 w-6 h-6 p-0 flex items-center justify-center rounded border border-brand-gold/30 transition-colors"
                                                        >
                                                            <ChevronUp className="w-3 h-3 text-brand-gold" />
                                                        </button>
                                                        <span className="mx-2 min-w-[20px] text-center font-bold text-brand-gold">
                                                            {set.set_order}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                moveSet(
                                                                    set.id,
                                                                    set.set_order +
                                                                        1
                                                                )
                                                            }}
                                                            disabled={
                                                                set.set_order ===
                                                                storeSets.length
                                                            }
                                                            className="bg-gray-700/80 hover:bg-gray-600/80 disabled:opacity-50 w-6 h-6 p-0 flex items-center justify-center rounded border border-brand-gold/30 transition-colors"
                                                        >
                                                            <ChevronDown className="w-3 h-3 text-brand-gold" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {set.set_number}
                                                </TableCell>
                                                <TableCell>
                                                    {set.set_type || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {formatLoading(set.loading)}
                                                </TableCell>
                                                <TableCell>
                                                    {set.reps || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {set.rest
                                                        ? `${set.rest}s`
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {set.focus || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {set.notes ? (
                                                        <span
                                                            className="truncate block max-w-[120px]"
                                                            title={set.notes}
                                                        >
                                                            {set.notes}
                                                        </span>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleSetComplete(
                                                                set.id,
                                                                set.complete
                                                            )
                                                        }}
                                                        className={`px-3 py-1 text-xs rounded border transition-colors flex items-center justify-center gap-1 ${
                                                            set.complete
                                                                ? 'bg-green-600/80 hover:bg-green-700/80 text-white border-green-500/50'
                                                                : 'bg-gray-600/80 hover:bg-gray-700/80 text-white border-gray-500/50'
                                                        }`}
                                                    >
                                                        {set.complete ? (
                                                            <>
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                <span>Done</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3 h-3" />
                                                                <span>Pending</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </TableCell>
                                            </tr>
                                        </Popover.Trigger>
                                        {activeSetId === set.id && (
                                            <RadialMenuPopover
                                                setId={set.id}
                                                workoutId={set.workout}
                                                closeMenu={() =>
                                                    setActiveSetId(null)
                                                }
                                                onEdit={handleEdit}
                                            />
                                        )}
                                    </Popover.Root>
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal using portal */}
            {editingSetId !== null &&
                createPortal(
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                        <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
                            <SetEditForm
                                setId={editingSetId}
                                onClose={closeEditModal}
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    )
}

export default SetsTableFull
