import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { LucideArrowDown } from 'lucide-react'
import logo from '../../assets/gains-trust-logo-final.png'


export function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center h-[80vh] bg-black text-white">
            {/* Hero Text */}
            <br />
            <br />
            <motion.img
                src={logo}
                alt="Gains Trust Logo"
                className="w-24 h-24 mb-4"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 2.8 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <br />
            <br />
            <br />

            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-6xl font-bold uppercase tracking-wide text-yellow-600"
            >
                Gains Trust
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="mt-4 text-lg text-gray-300 max-w-xl text-center"
            >
                Track workouts with precision. <br />
                Analyze progress. <br />
                Build unstoppable strength.
            </motion.p>

            {/* Call to Action */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
                className="mt-6"
            >
                <Button variant="primary" size="lg">Get Started</Button>
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
                <span className="text-gray-400 text-sm uppercase">Features</span>
                <LucideArrowDown className="w-6 h-6 text-gray-400 animate-bounce" />
            </motion.div>
        </section>
    )
}
