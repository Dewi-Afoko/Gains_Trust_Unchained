import React from 'react'
import texture2 from '../../assets/texture2.png'

// Call like this: <PanelHeader title="User Details" icon={BarChart2} useGainsFont={false} size="normal" />
const PanelHeader = React.forwardRef(({ title, icon: Icon, useGainsFont = true, size = 'normal' }, ref) => {
    const sizeClasses = {
        normal: 'text-sm sm:text-base py-1.5',
        large: 'text-xl sm:text-2xl py-3'
    }

    const iconSizes = {
        normal: 'w-5 h-5 mr-2',
        large: 'w-8 h-8 mr-3'
    }

    const selectedSize = sizeClasses[size] || sizeClasses.normal
    const iconSize = iconSizes[size] || iconSizes.normal

    return (
        <div
            ref={ref}
            className={`relative w-full flex items-center justify-between border border-brand-gold/80 bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e] rounded-t-lg shadow-inner px-4 mb-6 ${selectedSize}`}
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(234,179,8,0.18) 0%, #1a1a1a 40%, #0e0e0e 100%), url(${texture2})`,
                backgroundBlendMode: 'overlay, multiply',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Left rivet */}
            <span className="w-2 h-2 bg-yellow-700 rounded-full shadow-inner opacity-70 mr-3 flex-shrink-0" />
            <span className="flex-1 flex items-center justify-center min-w-0">
                <div className="flex items-center">
                    {Icon && (
                        <Icon className={`text-orange-400 flex-shrink-0 drop-shadow self-center ${iconSize}`} />
                    )}
                    <span className={`
                        uppercase font-bold tracking-widest
                        bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text 
                        drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] text-center leading-tight
                        ${useGainsFont ? 'gains-font' : ''}
                        ${size === 'large' ? '' : 'truncate'}
                    `}>
                        {title}
                    </span>
                </div>
            </span>
            {/* Right rivet */}
            <span className="w-2 h-2 bg-yellow-700 rounded-full shadow-inner opacity-70 ml-3 flex-shrink-0" />
        </div>
    )
})

// Add display name for better debugging
PanelHeader.displayName = 'PanelHeader'

export default PanelHeader
