import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { showToast } from '../../utils/toast'
import { login as loginApi } from '../../api/authApi'
import PanelButton from '../ui/PanelButton'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'

const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const onSubmit = async (data) => {
        try {
            const response = await loginApi(data.username, data.password)

            login(
                response.user,
                response.access_token,
                response.refresh_token
            )

            showToast(
                `Welcome, Comrade ${data.username}! Redirecting...`,
                'success'
            )
            setTimeout(() => navigate('/dashboard'), 1500)
        } catch (error) {
            showToast('Invalid credentials. Try again, comrade!', 'error')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md mx-auto bg-brand-dark-2 p-8 rounded-xl border-2 border-brand-gold shadow-2xl animate-fadeIn">
            <div className="text-center mb-4">
                <p className="text-gray-300">
                    Enter your credentials to continue
                </p>
            </div>
            <div className="space-y-5">
                <label className="block text-brand-gold font-semibold mb-1">
                    Username
                    <input
                        {...register('username', { required: 'Username is required' })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="Enter your username"
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.username.message}
                        </p>
                    )}
                </label>
                <label className="block text-brand-gold font-semibold mb-1">
                    Password
                    <input
                        type="password"
                        {...register('password', { required: 'Password is required' })}
                        className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        placeholder="Enter your password"
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
                Sign In
            </PanelButton>
            
            <div className="text-center mt-4">
                <Link 
                    to="/forgot-password" 
                    className="text-brand-gold hover:text-yellow-300 text-sm underline transition"
                >
                    Forgot your password?
                </Link>
            </div>
        </form>
    )
}

export default LoginForm
