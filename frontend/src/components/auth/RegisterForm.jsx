import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import debounce from 'lodash.debounce'
import { showToast } from '../../utils/toast'
import { register as registerApi } from '../../api/authApi'
import { checkAvailability } from '../../api/usersApi'
import PanelButton from '../ui/PanelButton'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'

const RegisterForm = () => {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        trigger,
    } = useForm()

    const checkAvailabilityDebounced = debounce(async (value, type) => {
        if (!value) return
        try {
            await checkAvailability({ [type]: value })
            trigger(type)
        } catch (error) {
            if (error.response?.status === 400) {
                setError(type, {
                    type: 'manual',
                    message:
                        type === 'username'
                            ? 'Username unavailable'
                            : 'Email already registered',
                })
            }
        }
    }, 500)

    const onSubmit = async (data) => {
        try {
            await registerApi(data)
            showToast('Registration successful! Redirecting...', 'success')
            setTimeout(() => navigate('/login'), 1500)
        } catch (error) {
            showToast(
                error.response?.data?.detail || 'Registration failed',
                'error'
            )
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md mx-auto bg-brand-dark-2 p-8 rounded-xl border-2 border-brand-gold shadow-2xl animate-fadeIn">
            <div className="text-center mb-4">
                <p className="text-gray-300">
                    Create your account to get started
                </p>
            </div>
            <div className="space-y-5">
                <label className="block text-brand-gold font-semibold mb-1">
                    Username
                    <input
                        {...register('username', {
                            required: 'Username is required',
                            onBlur: (e) =>
                                checkAvailabilityDebounced(e.target.value, 'username'),
                        })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="Choose a username"
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.username.message}
                        </p>
                    )}
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Email
                    <input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /\S+@\S+\.\S+/, // eslint-disable-line
                                message: 'Invalid email',
                            },
                            onBlur: (e) =>
                                checkAvailabilityDebounced(e.target.value, 'email'),
                        })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="Enter your email"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.email.message}
                        </p>
                    )}
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Password
                    <input
                        type="password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Minimum 6 characters',
                            },
                        })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="Create a password"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.password.message}
                        </p>
                    )}
                </label>
            </div>
            <PanelButton
                type="submit"
                variant="gold"
                className="w-full px-6 py-3 text-lg mt-6"
                disabled={false}
            >
                Register
            </PanelButton>
        </form>
    )
}

export default RegisterForm
