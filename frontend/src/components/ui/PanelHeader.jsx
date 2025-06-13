import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import texture2 from '../../assets/texture2.png'

// Call like this: <PanelHeader title="User Details" icon={BarChart2} useGainsFont={false} size="normal" />
// For collapsible: <PanelHeader title="User Details" icon={BarChart2} collapsible isExpanded={true} onToggle={handleToggle} />
const PanelHeader = React.forwardRef(
    (
        {
            title,
            icon: Icon,
            useGainsFont = true,
            size = 'normal',
            collapsible = false,
            isExpanded = true,
            onToggle,
        },
        ref
    ) => {
        const sizeClasses = {
            normal: 'text-sm sm:text-base py-1.5',
            large: 'text-xl sm:text-2xl py-3',
        }

        const iconSizes = {
            normal: 'w-5 h-5 mr-2',
            large: 'w-8 h-8 mr-3',
        }

        const selectedSize = sizeClasses[size] || sizeClasses.normal
        const iconSize = iconSizes[size] || iconSizes.normal

        const headerContent = (
            <div
                ref={ref}
                className={`relative w-full flex items-center justify-between border border-brand-gold/80 bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e] rounded-t-lg shadow-inner px-4 mb-6 ${selectedSize} ${
                    collapsible
                        ? 'cursor-pointer hover:from-yellow-600/70 hover:border-brand-gold transition-all duration-200 group'
                        : ''
                }`}
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(234,179,8,0.18) 0%, #1a1a1a 40%, #0e0e0e 100%), url(${texture2})`,
                    backgroundBlendMode: 'overlay, multiply',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                onClick={collapsible ? onToggle : undefined}
            >
                {/* Left rivet */}
                <span className="w-2 h-2 bg-yellow-700 rounded-full shadow-inner opacity-70 mr-3 flex-shrink-0" />

                <span className="flex-1 flex items-center justify-center min-w-0">
                    <div className="flex items-center">
                        {Icon && (
                            <Icon
                                className={`text-orange-400 flex-shrink-0 drop-shadow self-center ${iconSize} ${
                                    collapsible
                                        ? 'group-hover:text-yellow-300 transition-colors'
                                        : ''
                                }`}
                            />
                        )}
                        <span
                            className={`
                        font-extrabold uppercase tracking-wider
                        bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text 
                        drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] text-center leading-tight
                        ${size === 'large' ? '' : 'truncate'}
                        ${collapsible ? 'group-hover:from-yellow-300 group-hover:via-yellow-500 group-hover:to-orange-600 transition-all' : ''}
                    `}
                        >
                            {title}
                        </span>
                    </div>
                </span>

                {/* Right side - Rivet or Chevron */}
                {collapsible ? (
                    <div className="ml-3 flex items-center gap-2">
                        {/* Hover hint text */}
                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium hidden sm:block">
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </span>
                        {/* Chevron with background */}
                        <div className="bg-brand-gold/20 rounded-full p-1.5 group-hover:bg-brand-gold/40 transition-colors">
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-brand-gold group-hover:text-yellow-300 transition-colors" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-brand-gold group-hover:text-yellow-300 transition-colors" />
                            )}
                        </div>
                    </div>
                ) : (
                    /* Right rivet for non-collapsible */
                    <span className="w-2 h-2 bg-yellow-700 rounded-full shadow-inner opacity-70 ml-3 flex-shrink-0" />
                )}
            </div>
        )

        return headerContent
    }
)

// Add display name for better debugging
PanelHeader.displayName = 'PanelHeader'

export default PanelHeader
