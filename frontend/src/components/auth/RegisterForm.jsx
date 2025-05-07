import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import debounce from 'lodash.debounce'
import { showToast } from '../../utils/toast'
import { register as registerApi } from '../../api/authApi'
import { checkAvailability } from '../../api/usersApi'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center">
                <p className="text-gray-300">
                    Create your account to get started
                </p>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-gold mb-1">
                        Username
                    </label>
                    <input
                        {...register('username', {
                            required: 'Username is required',
                            onBlur: (e) =>
                                checkAvailabilityDebounced(e.target.value, 'username'),
                        })}
                        className="w-full px-4 py-2 bg-brand-dark-2 border border-brand-gold rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Choose a username"
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.username.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-gold mb-1">
                        Email
                    </label>
                    <input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: 'Invalid email',
                            },
                            onBlur: (e) =>
                                checkAvailabilityDebounced(e.target.value, 'email'),
                        })}
                        className="w-full px-4 py-2 bg-brand-dark-2 border border-brand-gold rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Enter your email"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.email.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-gold mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Minimum 6 characters',
                            },
                        })}
                        className="w-full px-4 py-2 bg-brand-dark-2 border border-brand-gold rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Create a password"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.password.message}
                        </p>
                    )}
                </div>
            </div>
            <button
                type="submit"
                className="w-full bg-brand-red text-white font-semibold py-3 rounded-lg hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 transition-colors gains-font"
            >
                Register
            </button>
        </form>
    )
}

export default RegisterForm
