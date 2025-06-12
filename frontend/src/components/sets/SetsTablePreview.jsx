import { formatLoading } from '../../utils/formatters'
import { useState } from 'react'
import texture2 from '../../assets/texture2.png'
import * as Popover from '@radix-ui/react-popover'
import RadialMenuPopover from '../ui/RadialMenuPopover'
import { SetEditModal } from './SetEditForm'

const TableHeader = ({ children }) => (
    <th className="border-b border-r border-brand-gold/30 p-3 first:border-l text-center">
        <div className="font-bold uppercase tracking-wider text-sm bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
            {children}
        </div>
    </th>
)

const TableCell = ({ children }) => (
    <td className="border-b border-r border-brand-gold/30 p-3 first:border-l text-center">
        <span className="text-gray-300 font-medium">
            {children}
        </span>
    </td>
)

const SetsTablePreview = ({ sets, workoutId }) => {
    const [activeSetId, setActiveSetId] = useState(null)
    const [editingSetId, setEditingSetId] = useState(null)

    if (!sets || sets.length === 0) {
        return (
            <div className="flex justify-center items-center p-6 bg-black/20 rounded-lg border border-brand-gold/30">
                <span className="text-gray-400 font-medium uppercase tracking-wider">No sets available.</span>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-brand-gold/30 relative">
            {/* Background texture layer */}
            <div 
                className="absolute inset-0 rounded-lg opacity-40"
                style={{
                    backgroundImage: `url(${texture2})`,
                    backgroundSize: '500px 500px',
                    backgroundRepeat: 'repeat',
                    backgroundAttachment: 'scroll',
                    backgroundPosition: 'center center',
                }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 rounded-lg" />
            
            {/* Table content */}
            <div className="relative">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e]">
                            <TableHeader>Exercise</TableHeader>
                            <TableHeader>Set Count</TableHeader>
                            <TableHeader>Set Type</TableHeader>
                            <TableHeader>Loading</TableHeader>
                            <TableHeader>Reps</TableHeader>
                            <TableHeader>Rest (s)</TableHeader>
                            <TableHeader>Focus</TableHeader>
                            <TableHeader>Notes</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sets.map((set, index) => (
                            <Popover.Root key={set.id} open={activeSetId === set.id} onOpenChange={(open) => {
                                if (!open) setActiveSetId(null)
                            }}>
                                <Popover.Trigger asChild>
                                    <tr 
                                        className={`
                                            relative
                                            transition-colors duration-150
                                            hover:bg-black/40
                                            cursor-pointer
                                            ${index % 2 === 0 ? 'bg-black/20' : 'bg-black/10'}
                                        `}
                                        style={{
                                            height: '48px' // Ensure consistent row height
                                        }}
                                        onClick={() => setActiveSetId(set.id)}
                                    >
                                        <TableCell>{set.exercise_name}</TableCell>
                                        <TableCell>{set.set_number}</TableCell>
                                        <TableCell>{set.set_type || 'N/A'}</TableCell>
                                        <TableCell>{formatLoading(set.loading)}</TableCell>
                                        <TableCell>{set.reps || 'N/A'}</TableCell>
                                        <TableCell>{set.rest || 'N/A'}</TableCell>
                                        <TableCell>{set.focus || 'N/A'}</TableCell>
                                        <TableCell>{set.notes || 'N/A'}</TableCell>
                                    </tr>
                                </Popover.Trigger>
                                {activeSetId === set.id && (
                                    <RadialMenuPopover 
                                        setId={set.id} 
                                        workoutId={workoutId} 
                                        closeMenu={() => setActiveSetId(null)}
                                        onEdit={id => {
                                            setEditingSetId(id)
                                            setActiveSetId(null)
                                        }}
                                    />
                                )}
                            </Popover.Root>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* SetEditModal for editing */}
            <SetEditModal setId={editingSetId} open={!!editingSetId} onClose={() => setEditingSetId(null)} />
        </div>
    )
}

export default SetsTablePreview
