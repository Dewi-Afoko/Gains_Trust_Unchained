import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <div className="bg-red-900 min-h-screen text-yellow-300">
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center py-20">
                <h1 className="text-5xl font-extrabold uppercase">
                    Welcome to Gains Trust
                </h1>
                <p className="mt-4 text-lg max-w-xl">
                    The ultimate training log. Built for strength, power, and
                    precision.
                </p>
                <Link to="/register">
                    <button className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 text-lg font-bold uppercase rounded-none border-2 border-yellow-300">
                        Get Started
                    </button>
                </Link>
            </section>

            {/* Overview Section */}
            <section className="py-16 px-8 text-center bg-red-800">
                <h2 className="text-3xl font-bold">What is Gains Trust?</h2>
                <p className="mt-4 max-w-2xl mx-auto">
                    Gains Trust is a **data-driven strength tracking** platform
                    designed for lifters who want **full control over their
                    progress**.
                </p>
            </section>

            {/* Call to Action */}
            <section className="py-12 text-center">
                <h2 className="text-3xl font-bold">Join the Revolution</h2>
                <p className="mt-2">Track. Adapt. Conquer.</p>
                <Link to="/login">
                    <button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 text-lg font-bold uppercase rounded-none border-2 border-yellow-300">
                        Log In
                    </button>
                </Link>
            </section>
        </div>
    )
}

export default Home
