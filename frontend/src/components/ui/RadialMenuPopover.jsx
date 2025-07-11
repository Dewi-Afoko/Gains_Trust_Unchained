import * as React from 'react'
import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Copy, Trash2 } from 'lucide-react'
import { SetEditModal } from '../sets/SetEditForm'
import useWorkoutStore from '../../stores/workoutStore'
import { showToast } from '../../utils/toast'
import PanelButton from './PanelButton'
import texture2 from '../../assets/texture2.png'

// Function to generate SVG path for a 120-degree pie slice (adjusted for r=25)
const createPieSlicePath = (index, cx, cy, r, innerRadius = 10) => {
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

// Function to calculate icon position (adjusted for r=25)
const calculateIconPosition = (index, cx, cy, r) => {
    const angle = (index * 120 + 60 - 90) * (Math.PI / 180) // Center of each segment
    const iconRadius = r * 0.6 // Position icons at 60% of radius
    return {
        x: cx + iconRadius * Math.cos(angle),
        y: cy + iconRadius * Math.sin(angle),
    }
}

// Accepts: setId, workoutId, closeMenu, onEdit
const RadialMenuPopover = React.forwardRef(
    ({ setId, workoutId, closeMenu, onEdit }, ref) => {
        const { deleteSet, duplicateSet, sets } = useWorkoutStore()
        const [loading, setLoading] = useState(false)
        const [activeAction, setActiveAction] = useState(null)

        // Get the full set data
        const set = sets.find((s) => s.id === setId)

        // Menu sizing (75x75)
        const menuSize = 75
        const cx = 37.5 // Center X
        const cy = 37.5 // Center Y
        const r = 37.5 // Radius
        const iconSize = 18 // 0.75x of 24px

        const handleDelete = async () => {
            setLoading(true)
            setActiveAction('delete')
            try {
                await deleteSet(workoutId, setId)
                closeMenu()
            } catch (error) {
                // Error toast is already shown in the store
            } finally {
                setLoading(false)
                setActiveAction(null)
            }
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

        // Edit action: call onEdit and close popover
        const handleEdit = () => {
            onEdit(setId)
            closeMenu()
        }

        const menuItems = [
            {
                label: 'Edit',
                action: handleEdit,
                color: '#D97706', // brand amber/orange
                hoverColor: '#F59E0B', // lighter amber
                icon: Edit,
                id: 'edit',
            },
            {
                label: 'Delete',
                action: handleDelete,
                color: '#B91C1C', // brand red
                hoverColor: '#DC2626', // lighter red
                icon: Trash2,
                id: 'delete',
            },
            {
                label: 'Duplicate',
                action: handleDuplicate,
                color: '#166534', // dark green
                hoverColor: '#16A34A', // lighter green
                icon: Copy,
                id: 'duplicate',
            },
        ]

        return (
            <Popover.Content
                ref={ref}
                side="bottom"
                align="center"
                sideOffset={8}
                className="z-[1000] p-0 border-2 border-brand-gold rounded-full shadow-2xl drop-shadow-xl ring-2 ring-brand-gold/30 ring-offset-2 ring-offset-brand-dark-2 animate-fadeIn"
                style={{
                    width: menuSize,
                    height: menuSize,
                    minWidth: menuSize,
                    minHeight: menuSize,
                    boxShadow:
                        '0 8px 32px 0 rgba(234, 179, 8, 0.25), 0 4px 16px 0 rgba(0,0,0,0.6)',
                    background: `radial-gradient(circle at 60% 40%, #2d2d2d 40%, #1a1a1a 100%), url(${texture2})`,
                    backgroundBlendMode: 'overlay, multiply',
                    backgroundSize: 'cover, 80px 80px',
                    backgroundPosition: 'center, center',
                    filter: 'drop-shadow(0 0 16px rgba(234, 179, 8, 0.3))',
                    outline: 'none',
                    pointerEvents: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 30 }}
                        className="relative"
                    >
                        <svg
                            viewBox="0 0 75 75"
                            width={menuSize}
                            height={menuSize}
                            className="drop-shadow-lg"
                        >
                            {/* Define all gradients */}
                            <defs>
                                <radialGradient
                                    id="centerGradient"
                                    cx="0.3"
                                    cy="0.3"
                                >
                                    <stop offset="0%" stopColor="#2d2d2d" />
                                    <stop offset="70%" stopColor="#1a1a1a" />
                                    <stop offset="100%" stopColor="#0e0e0e" />
                                </radialGradient>
                                <linearGradient
                                    id="loadingGradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="0%"
                                >
                                    <stop offset="0%" stopColor="#F59E0B" />
                                    <stop offset="50%" stopColor="#EAB308" />
                                    <stop offset="100%" stopColor="#D97706" />
                                </linearGradient>
                            </defs>

                            {/* Center circle with brand styling */}
                            <circle
                                cx={cx}
                                cy={cy}
                                r="18"
                                fill="url(#centerGradient)"
                                className="stroke-brand-gold"
                                strokeWidth="2"
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))',
                                }}
                            />

                            {menuItems.map((item, index) => {
                                const iconPos = calculateIconPosition(
                                    index,
                                    cx,
                                    cy,
                                    r
                                )
                                return (
                                    <g key={item.id}>
                                        <motion.path
                                            d={createPieSlicePath(
                                                index,
                                                cx,
                                                cy,
                                                r
                                            )}
                                            fill={item.color}
                                            initial={{ opacity: 0.8 }}
                                            whileHover={{
                                                opacity: 1,
                                                fill: item.hoverColor,
                                                transition: { duration: 0.2 },
                                            }}
                                            className={`cursor-pointer transition-all duration-200 ${
                                                loading &&
                                                activeAction === item.id
                                                    ? 'opacity-50'
                                                    : ''
                                            }`}
                                            onClick={
                                                !loading
                                                    ? item.action
                                                    : undefined
                                            }
                                            style={{
                                                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.4)) drop-shadow(0 0 4px rgba(234, 179, 8, 0.2))',
                                            }}
                                        />
                                        <motion.g
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                delay: index * 0.1,
                                                type: 'spring',
                                                stiffness: 300,
                                            }}
                                            className="pointer-events-none"
                                            style={{
                                                transformOrigin: `${iconPos.x}px ${iconPos.y}px`,
                                            }}
                                        >
                                            <item.icon
                                                x={iconPos.x - iconSize / 2}
                                                y={iconPos.y - iconSize / 2}
                                                width={iconSize}
                                                height={iconSize}
                                                className="text-white drop-shadow"
                                                style={{
                                                    filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.6)) drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                                                    strokeWidth: 2.5,
                                                }}
                                            />
                                        </motion.g>
                                    </g>
                                )
                            })}
                            {loading && (
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r="14"
                                    fill="none"
                                    stroke="url(#loadingGradient)"
                                    strokeWidth="3"
                                    strokeDasharray="30 30"
                                    className="animate-spin"
                                    style={{
                                        filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))',
                                    }}
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from={`0 ${cx} ${cy}`}
                                        to={`360 ${cx} ${cy}`}
                                        dur="1s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}
                        </svg>
                    </motion.div>
                </AnimatePresence>
            </Popover.Content>
        )
    }
)

RadialMenuPopover.displayName = 'RadialMenuPopover'

export default RadialMenuPopover
