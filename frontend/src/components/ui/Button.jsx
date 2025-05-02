import React from 'react'
import { tv } from 'tailwind-variants'
import { motion } from 'framer-motion'

const button = tv({
    base: 'px-4 py-2 font-bold rounded-md transition-all duration-150',
    variants: {
        variant: {
            primary:
                'bg-red-700 text-white border border-red-900 hover:bg-yellow-600 hover:text-black active:bg-yellow-700',

            secondary:
                'bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 active:bg-gray-900',
            ghost: 'bg-transparent text-gray-300 border border-gray-600 hover:bg-gray-800 active:bg-gray-900',
        },
        size: {
            sm: 'text-sm px-3 py-1',
            md: 'text-base px-4 py-2',
            lg: 'text-lg px-6 py-3',
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
    },
})

export function Button({ children, variant, size, className, ...props }) {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }} // Adds mechanical press effect
            className={button({ variant, size, className })}
            {...props}
        >
            {children}
        </motion.button>
    )
}
