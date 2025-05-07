import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { LucideArrowDown } from 'lucide-react'
import logo from '../../assets/gains-trust-logo-final.png'
import industrialTexture from '../../assets/industrial-texture.png'
import Terminal from 'react-terminal-ui'
import { useState, useEffect } from 'react'

export function Hero() {
    const terminalLines = [
        '> Welcome to GAINS TRUST!',
        '> Track workouts with precision.',
        '> Analyse progress.',
        '> Build unstoppable strength.',
    ]

    const [typedLines, setTypedLines] = useState([]) // Stores all completed & active lines
    const [isTypingComplete, setIsTypingComplete] = useState(false) // Track overall completion

    useEffect(() => {
        let index = 0
        let charIndex = 0

        const typeNextChar = () => {
            if (index >= terminalLines.length) return // Prevent accessing undefined index

            setTypedLines((prev) => {
                const newLines = [...prev]
                const currentLine = newLines[index] || '' // Get current line being typed

                // Append next character
                if (terminalLines[index]) {
                    // ✅ Ensure the line exists before accessing substring
                    newLines[index] = terminalLines[index].substring(
                        0,
                        charIndex + 1
                    )
                }
                return newLines
            })

            charIndex++

            if (charIndex < terminalLines[index]?.length) {
                // ✅ Ensure index is valid before accessing length
                setTimeout(typeNextChar, 50) // Continue typing current line
            } else {
                index++ // Move to next line
                charIndex = 0
                if (index === terminalLines.length) {
                    setIsTypingComplete(true) // Mark typing as done
                } else {
                    setTimeout(typeNextChar, 200) // Delay before starting next line
                }
            }
        }

        setTimeout(typeNextChar, 500) // Initial delay before typing starts
    }, [])

    return (
        <section className="relative w-full h-[95vh] flex flex-col items-center justify-center text-center bg-black">
            {/* Background Texture */}
            <br />
            <br />
            <br />
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `url(${industrialTexture})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            {/* Hero Text */}
            <div className="relative flex items-center justify-center">
                {/* Glowing Red Effect */}
                <motion.div
                    className="absolute w-48 h-48 rounded-full bg-yellow-700 opacity-30 blur-3xl pointer-events-none"
                    initial={{ opacity: 0.4, scale: 1 }}
                    animate={{
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                {/* Logo Image */}
                <motion.img
                    src={logo}
                    alt="Gains Trust Logo"
                    className="relative w-24 h-24 mb-4"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 2.8 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>

            <br />
            <br />
            <br />
            <br />

            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-6xl font-bold uppercase tracking-wide bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] gains-font"
            >
                Gains Trust
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className="w-full max-w-lg mx-auto mt-6"
            >
                <Terminal
                    name="GAINS TRUST PROTOCOL STARTED"
                    colorMode="dark"
                    height="108px"
                >
                    {/* Render all typed lines, with the blinking cursor on the last */}
                    {typedLines.map((line, idx) => (
                        <motion.p
                            key={idx}
                            className="text-yellow-400 font-mono"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.5 }}
                        >
                            {line}
                            {idx === typedLines.length - 1 &&
                                !isTypingComplete && (
                                <motion.span
                                    className="text-yellow-400"
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                        █
                                </motion.span>
                            )}
                        </motion.p>
                    ))}
                </Terminal>
            </motion.div>

            {/* Call to Action */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
                className="mt-6 relative z-20" //  Ensure it's above everything else
            >
                <Button variant="primary" size="lg" className="relative z-30">
                    Get Started
                </Button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
                className="absolute bottom-10 flex flex-col items-center"
            >
                <span className="text-gray-400 text-sm uppercase">
                    Features
                </span>
                <LucideArrowDown className="w-6 h-6 text-gray-400 animate-bounce" />
            </motion.div>
        </section>
    )
}
