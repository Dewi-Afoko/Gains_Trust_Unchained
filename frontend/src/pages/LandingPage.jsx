import React from 'react'
import { Hero } from '../components/sections/Hero'
import { Features } from '../components/sections/Features'
import { Testimonials } from '../components/sections/Testimonials'
import { FinalCTA } from '../components/sections/FinalCTA'

export default function LandingPage() {
    return (
        <main>
            <Hero />
            <Features />
            <Testimonials />
            <FinalCTA />
        </main>
    )
}
