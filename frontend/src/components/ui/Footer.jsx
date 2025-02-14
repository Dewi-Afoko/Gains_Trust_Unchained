import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-[#8B0000] text-white text-center p-4 mt-8">
            <p className="text-sm">
                &copy; {new Date().getFullYear()} Gains Trust Unchained. All
                rights reserved.
            </p>
        </footer>
    )
}

export default Footer
