import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../providers/AuthContext'
import toast from 'react-hot-toast' // ✅ Import toast notifications

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()
    const navigate = useNavigate()
    const { login } = useAuthContext()

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/users/login/`,
                data
            )

            login(
                { username: data.username },
                response.data.access,
                response.data.refresh
            )

            toast.success(`Welcome, Comrade ${data.username}! Redirecting...`)
            setTimeout(() => navigate('/dashboard'), 1500) // ✅ Faster transition
        } catch (error) {
            toast.error('Invalid credentials. Try again, comrade!')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center">
                <p className="text-gray-300">Enter your credentials to continue</p>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-gold mb-1">
                        Username
                    </label>
                    <input
                        {...register('username', {
                            required: 'Username is required',
                        })}
                        className="w-full px-4 py-2 bg-brand-dark-2 border border-brand-gold rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Enter your username"
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.username.message}
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
                        })}
                        className="w-full px-4 py-2 bg-brand-dark-2 border border-brand-gold rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Enter your password"
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
                Sign In
            </button>
        </form>
    )
}

export default LoginForm
