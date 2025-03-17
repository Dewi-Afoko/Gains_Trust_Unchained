import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-[#222] text-white text-center p-6 mt-0 border-t border-yellow-600 shadow-lg">
            <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Gains Trust Unchained. All rights reserved.
            </p>
        </footer>
    )
}

export default Footer
