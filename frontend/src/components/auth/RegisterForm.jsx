import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import debounce from 'lodash.debounce'
import toast from 'react-hot-toast' // ✅ Import toast notifications

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

    const checkAvailability = debounce(async (value, type) => {
        if (!value) return
        try {
            const response = await axios.get(
                `${API_BASE_URL}/users/check_availability/`,
                {
                    params: { [type]: value },
                }
            )
            if (response.status === 200) trigger(type)
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
            await axios.post(`${API_BASE_URL}/users/register/`, data)
            toast.success('Registration successful! Redirecting...')
            setTimeout(() => navigate('/login'), 1500) // ✅ Faster transition
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed')
        }
    }

    return (
        <div className="max-w-md mx-auto">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col space-y-4 bg-[#8B0000] text-white p-6 rounded-lg shadow-md"
            >
                <h2 className="text-xl font-bold">Register</h2>

                <label className="flex flex-col">
                    Username
                    <input
                        {...register('username', {
                            required: 'Username is required',
                            onBlur: (e) =>
                                checkAvailability(e.target.value, 'username'),
                        })}
                        className="p-2 rounded text-black"
                    />
                    {errors.username && (
                        <p className="text-yellow-400">
                            {errors.username.message}
                        </p>
                    )}
                </label>

                <label className="flex flex-col">
                    Email
                    <input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: 'Invalid email',
                            },
                            onBlur: (e) =>
                                checkAvailability(e.target.value, 'email'),
                        })}
                        className="p-2 rounded text-black"
                    />
                    {errors.email && (
                        <p className="text-yellow-400">
                            {errors.email.message}
                        </p>
                    )}
                </label>

                <label className="flex flex-col">
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
                        className="p-2 rounded text-black"
                    />
                    {errors.password && (
                        <p className="text-yellow-400">
                            {errors.password.message}
                        </p>
                    )}
                </label>

                <button
                    type="submit"
                    className="bg-yellow-400 text-black font-bold p-2 rounded hover:bg-yellow-300"
                >
                    Register
                </button>
            </form>
        </div>
    )
}

export default RegisterForm
