import React from 'react'
import texture2 from '../../assets/texture2.png'

// PanelButton: variant='gold' | 'danger'
const VARIANT_STYLES = {
    gold: {
        base: 'bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e]',
        hover: 'hover:from-brand-red/90 hover:via-brand-red/80 hover:to-brand-red-dark/90',
        textGradient:
            'bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text',
        hoverTextGradient:
            'group-hover:from-white group-hover:via-gray-200 group-hover:to-gray-300',
        border: 'border-brand-gold/80',
        hoverBorder: 'hover:border-brand-red',
    },
    danger: {
        base: 'bg-gradient-to-b from-brand-red/90 via-brand-red/80 to-brand-red-dark/90',
        hover: 'hover:from-yellow-700/60 hover:via-[#1a1a1a] hover:to-[#0e0e0e]',
        textGradient:
            'bg-gradient-to-b from-white via-gray-200 to-gray-300 text-transparent bg-clip-text',
        hoverTextGradient:
            'group-hover:from-yellow-400 group-hover:via-yellow-600 group-hover:to-orange-700',
        border: 'border-brand-red',
        hoverBorder: 'hover:border-brand-gold/80',
    },
}

const PanelButton = React.forwardRef(
    ({ children, className = '', variant = 'gold', ...props }, ref) => {
        const variantStyles = VARIANT_STYLES[variant] || VARIANT_STYLES.gold
        return (
            <button
                ref={ref}
                className={`
                group
                relative
                w-full flex items-center justify-center
                px-6 py-2.5
                rounded
                border
                shadow-inner
                ${variantStyles.base}
                ${variantStyles.hover}
                ${variantStyles.border}
                ${variantStyles.hoverBorder}
                mb-2
                select-none
                
                /* Animations */
                transition-all
                duration-75
                ease-in-out
                
                /* Hover Effects */
                hover:shadow-inner
                
                /* Press Effects */
                active:scale-[0.98]
                active:translate-y-[0.5px]
                active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
                
                /* Focus States */
                focus:outline-none
                focus:ring-1
                focus:ring-offset-1
                focus:ring-offset-[#0e0e0e]
                focus:ring-current
                
                /* Custom Class Override */
                ${className}
            `}
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(234,179,8,0.18) 0%, #1a1a1a 40%, #0e0e0e 100%), url(${texture2})`,
                    backgroundBlendMode: 'overlay, multiply',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                {...props}
            >
                {/* Left rivet */}
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />

                {/* Button Content */}
                <span
                    className={`
                font-bold uppercase tracking-widest text-sm flex items-center
                ${variantStyles.textGradient}
                ${variantStyles.hoverTextGradient}
                drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]
            `}
                >
                    {children}
                </span>

                {/* Right rivet */}
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
            </button>
        )
    }
)

// Add display name for better debugging
PanelButton.displayName = 'PanelButton'

export default PanelButton
