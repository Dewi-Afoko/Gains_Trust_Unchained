import * as React from 'react'
import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Copy, Trash2, X } from 'lucide-react'
import SetEditForm from '../sets/SetEditForm'
import useWorkoutStore from '../../stores/workoutStore'
import { showToast } from '../../utils/toast'
import PanelButton from './PanelButton'

// Function to generate SVG path for a 120-degree pie slice
const createPieSlicePath = (index, cx, cy, r, innerRadius = 20) => {
    const startAngle = index * 120 - 90 // Offset so first slice starts at top
    const endAngle = startAngle + 120

    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180)
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180)
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180)
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180)

    // Inner circle points
    const ix1 = cx + innerRadius * Math.cos((startAngle * Math.PI) / 180)
    const iy1 = cy + innerRadius * Math.sin((startAngle * Math.PI) / 180)
    const ix2 = cx + innerRadius * Math.cos((endAngle * Math.PI) / 180)
    const iy2 = cy + innerRadius * Math.sin((endAngle * Math.PI) / 180)

    return `
        M ${ix1},${iy1}
        L ${x1},${y1} 
        A ${r},${r} 0 0,1 ${x2},${y2}
        L ${ix2},${iy2}
        A ${innerRadius},${innerRadius} 0 0,0 ${ix1},${iy1}
        Z
    `
}

// Function to calculate icon position
const calculateIconPosition = (index, cx, cy, r) => {
    const angle = (index * 120 + 60 - 90) * (Math.PI / 180) // Center of each segment
    const iconRadius = r * 0.6 // Position icons at 60% of radius
    return {
        x: cx + iconRadius * Math.cos(angle),
        y: cy + iconRadius * Math.sin(angle)
    }
}

const RadialMenuPopover = React.forwardRef(({ setId, workoutId, closeMenu }, ref) => {
    const { deleteSet, duplicateSet, sets } = useWorkoutStore()
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeAction, setActiveAction] = useState(null)

    // Get the full set data
    const set = sets.find(s => s.id === setId)

    const handleDelete = async () => {
        setIsDeleting(true)
        setActiveAction('delete')
    }

    const confirmDelete = async () => {
        setLoading(true)
        try {
            await deleteSet(workoutId, setId)
            closeMenu()
        } catch (error) {
            // Error toast is already shown in the store
        } finally {
            setLoading(false)
            setIsDeleting(false)
            setActiveAction(null)
        }
    }

    const handleDuplicate = async () => {
        if (!set) {
            showToast('Cannot duplicate: Set data not found', 'error')
            return
        }
        setLoading(true)
        setActiveAction('duplicate')
        try {
            await duplicateSet(workoutId, set)
            showToast('Set duplicated successfully', 'success')
            closeMenu()
        } catch (error) {
            // Error toast is already shown in the store
        } finally {
            setLoading(false)
            setActiveAction(null)
        }
    }

    const menuItems = [
        { 
            label: 'Edit', 
            action: () => setIsEditing(true), 
            color: '#FFD700',
            hoverColor: '#FFC107',
            icon: Edit,
            id: 'edit'
        },
        {
            label: 'Delete',
            action: handleDelete,
            color: '#D90000',
            hoverColor: '#FF0000',
            icon: Trash2,
            id: 'delete'
        },
        {
            label: 'Duplicate',
            action: handleDuplicate,
            color: '#008000',
            hoverColor: '#00A000',
            icon: Copy,
            id: 'duplicate'
        },
    ]

    const cx = 50 // Center X
    const cy = 50 // Center Y
    const r = 50 // Radius

    return (
        <>
            <Popover.Content
                ref={ref}
                sideOffset={10}
                align="center"
                className="relative bg-transparent overflow-visible z-50"
                style={{
                    width: 'auto',
                    height: 'auto',
                    border: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                    minWidth: '300px',
                    maxWidth: '400px',
                }}
            >
                <AnimatePresence mode="wait">
                    {isEditing ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-brand-dark-2 p-6 rounded-xl border border-brand-gold shadow-lg"
                        >
                            <button
                                onClick={() => setIsEditing(false)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <SetEditForm
                                setId={setId}
                                onClose={() => {
                                    setIsEditing(false)
                                    closeMenu()
                                }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 30 }}
                            className="relative"
                        >
                            <svg viewBox="-10 -10 120 120" className="w-full h-full drop-shadow-lg">
                                {/* Center circle */}
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r="18"
                                    fill="#1a1a1a"
                                    className="stroke-brand-gold"
                                    strokeWidth="2"
                                />
                                {menuItems.map((item, index) => {
                                    const iconPos = calculateIconPosition(index, cx, cy, r)
                                    return (
                                        <g key={item.id}>
                                            <motion.path
                                                d={createPieSlicePath(index, cx, cy, r)}
                                                fill={item.color}
                                                initial={{ opacity: 0.8 }}
                                                whileHover={{ 
                                                    opacity: 1,
                                                    fill: item.hoverColor,
                                                    transition: { duration: 0.2 }
                                                }}
                                                className={`cursor-pointer transition-all duration-200 ${
                                                    loading && activeAction === item.id ? 'opacity-50' : ''
                                                }`}
                                                onClick={!loading ? item.action : undefined}
                                            />
                                            <motion.g
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="pointer-events-none"
                                                style={{
                                                    transformOrigin: `${iconPos.x}px ${iconPos.y}px`,
                                                }}
                                            >
                                                <item.icon
                                                    x={iconPos.x - 12}
                                                    y={iconPos.y - 12}
                                                    className="w-6 h-6 text-white drop-shadow"
                                                />
                                            </motion.g>
                                        </g>
                                    )
                                })}
                                {loading && (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r="15"
                                        fill="none"
                                        stroke="#FFD700"
                                        strokeWidth="2"
                                        strokeDasharray="30 30"
                                        className="animate-spin"
                                    >
                                        <animateTransform
                                            attributeName="transform"
                                            type="rotate"
                                            from="0 50 50"
                                            to="360 50 50"
                                            dur="1s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Popover.Content>

            {/* Delete Confirmation Modal */}
            {isDeleting && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[1000]">
                    <div className="bg-[#600000] p-6 rounded-xl border border-yellow-400 shadow-lg text-white max-w-sm">
                        <h3 className="text-lg font-bold text-yellow-400">
                            Confirm Deletion
                        </h3>
                        <p className="mt-2">
                            Are you sure you want to delete this set? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end mt-4 space-x-3">
                            <PanelButton
                                variant="gold"
                                className="w-auto px-4 py-2"
                                onClick={() => setIsDeleting(false)}
                            >
                                Cancel
                            </PanelButton>
                            <PanelButton
                                variant="danger"
                                className="w-auto px-4 py-2"
                                onClick={confirmDelete}
                            >
                                Delete
                            </PanelButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
})

RadialMenuPopover.displayName = 'RadialMenuPopover'

export default RadialMenuPopover
