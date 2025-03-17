import React from 'react'
import { motion } from 'framer-motion'
import { LucideDumbbell, LucideLineChart, LucideTarget } from 'lucide-react'

const features = [
    {
        icon: <LucideDumbbell className="w-10 h-10 text-yellow-600" />,
        title: 'Track Workouts',
        description: 'Log every set, rep, and weight with precision.',
    },
    {
        icon: <LucideLineChart className="w-10 h-10 text-yellow-600" />,
        title: 'Analyze Progress',
        description: 'Break down your training history with powerful insights.',
    },
    {
        icon: <LucideTarget className="w-10 h-10 text-yellow-600" />,
        title: 'Dominate Training',
        description: 'Structured planning to push past your limits.',
    },
]

export function Features() {
    return (
        <section className="py-16 bg-[#222] text-white border-t border-yellow-600">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl text-center font-bold uppercase tracking-wide bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] gains-font">
                    Features Built for Strength
                </h2>
                <p className="text-gray-400 text-center mt-2">
                    A workout tracker designed for those who take training seriously.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="relative p-6 rounded-lg text-center border-2 border-yellow-600 shadow-md bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] before:absolute before:inset-0 before:border-4 before:border-gray-700 before:rounded-lg before:opacity-40 hover:before:opacity-60 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 0.5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Riveted Metal Border Effect */}
                            <div className="absolute inset-0 border border-gray-800 shadow-inner opacity-50"></div>

                            <div className="flex justify-center mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold uppercase">{feature.title}</h3>
                            <p className="text-gray-400 mt-2">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
