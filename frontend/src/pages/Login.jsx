import React from 'react'
import LoginForm from '../components/auth/LoginForm'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/gains-trust-logo-final.png'

export default function Login() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-gradient-to-b from-yellow-900/10 via-black to-yellow-900/10 relative pt-36">
            {/* Logo and Heading */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="flex flex-col items-center mb-8"
            >
                <img
                    src={logo}
                    alt="Gains Trust Logo"
                    className="w-20 h-20 mb-4 drop-shadow-lg"
                />
                <h1 className="text-4xl md:text-5xl font-extrabold uppercase bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text text-center drop-shadow gains-font">
                    Welcome Back
                </h1>
                <p className="mt-2 text-lg text-gray-300 max-w-md text-center">
                    Log in to track your workouts, analyze your progress, and
                    keep building strength.
                </p>
            </motion.div>

            {/* Login Form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-md bg-[#181818] border-2 border-yellow-700 rounded-xl shadow-xl p-8"
            >
                <LoginForm />
                <div className="mt-6 text-center">
                    <span className="text-gray-400">
                        Don&apos;t have an account?
                    </span>{' '}
                    <Link
                        to="/register"
                        className="text-yellow-400 font-bold hover:underline"
                    >
                        Register
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
