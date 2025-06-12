/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './components/ui/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                'brand-black': '#000000',
                'brand-dark': '#181818',
                'brand-dark-2': '#222222',
                'brand-gold': '#FFD700', // main gold
                'brand-gold-dark': '#B8860B', // dark gold
                'brand-gold-gradient-from': '#FFD700',
                'brand-gold-gradient-via': '#FFB800',
                'brand-gold-gradient-to': '#FF8C00',
                'brand-red': '#8B0000', // main red
                'brand-red-dark': '#600000',
                'brand-red-light': '#B22222',
                'brand-red-bg': '#400000',
                'brand-white': '#FFFFFF',
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
        require('@tailwindcss/typography'), // ✅ Required for ShadCN animations
    ],
    darkMode: 'class', // ✅ Enables dark mode support for ShadCN components
}
