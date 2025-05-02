import React from 'react'
import { motion } from 'framer-motion'

const testimonials = [
    {
        name: 'Some Guy',
        quote: 'Before Gains Trust, my training was weak. Now I am strong like iron!',
        role: 'Powerlifter',
    },
    {
        name: 'Some Other Guy',
        quote: 'Gains Trust has turned my routine into a war machine. No wasted effort!',
        role: 'Olympic Weightlifter',
    },
    {
        name: 'A Third Guy',
        quote: 'You do not need motivation. You need discipline. Gains Trust provides structure!',
        role: 'Strongman Champion',
    },
]

export function Testimonials() {
    return (
        <section className="py-16 bg-black text-white border-t border-yellow-600">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl text-center font-bold uppercase tracking-wide bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] gains-font">
                    Strength in Numbers
                </h2>
                <p className="text-gray-400 text-center mt-2">
                    Elite athletes and comrades trust Gains Trust for their
                    training.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            className="p-6 bg-[#222] border-l-4 border-yellow-600 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.3 }}
                        >
                            <p className="text-xl italic text-gray-300">
                                &ldquo;{testimonial.quote}&rdquo;
                            </p>
                            <p className="text-yellow-600 font-bold mt-4">
                                {testimonial.name}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {testimonial.role}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
