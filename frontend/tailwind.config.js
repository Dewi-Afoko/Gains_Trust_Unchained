/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './components/ui/**/*.{js,jsx}'],
    theme: {
        extend: {},
    },
    plugins: [
        require('tailwindcss-animate'),
        require('@tailwindcss/typography'), // ✅ Required for ShadCN animations
    ],
    darkMode: 'class', // ✅ Enables dark mode support for ShadCN components
}
