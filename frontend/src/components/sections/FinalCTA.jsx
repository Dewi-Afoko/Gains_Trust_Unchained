import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

export function FinalCTA() {
    return (
        <section className="py-20 bg-[#222] text-white text-center border-t border-yellow-600">
            <div className="container mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="text-5xl font-bold uppercase text-yellow-600 tracking-wide"
                >
                    Ready to Train Smarter?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                    className="mt-4 text-lg text-gray-300 max-w-xl mx-auto"
                >
                        Create your first workout, track every set, and analyze your progress. We&apos;ll keep your training structured — you focus on GAINS!

                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
                    className="mt-6"
                >
                    <Button variant="primary" size="lg">Get Started</Button>
                </motion.div>
            </div>
        </section>
    )
}
