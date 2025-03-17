import React from 'react'
import { motion } from 'framer-motion'
import { LucideDumbbell, LucideLineChart, LucideTarget } from 'lucide-react'

const features = [
    {
        icon: <LucideDumbbell className="w-10 h-10 text-red-700" />,
        title: 'Track Workouts',
        description: 'Log every set, rep, and weight with precision.',
    },
    {
        icon: <LucideLineChart className="w-10 h-10 text-yellow-600" />,
        title: 'Analyze Progress',
        description: 'Break down your training history with powerful insights.',
    },
    {
        icon: <LucideTarget className="w-10 h-10 text-gray-300" />,
        title: 'Dominate Training',
        description: 'Structured planning to push past your limits.',
    },
]

export function Features() {
    return (
        <section className="py-16 bg-[#222] text-white border-t border-yellow-600">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center text-yellow-600">
            Features Built for Strength
                </h2>
                <p className="text-gray-300 text-center mt-2">
                    A workout tracker designed for those who take training seriously.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-black p-6 rounded-lg shadow-md text-center border border-yellow-600"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            <div className="flex justify-center mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="text-gray-300 mt-2">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
