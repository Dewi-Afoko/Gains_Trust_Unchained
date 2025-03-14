import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../../context/AuthContext'
import toast from 'react-hot-toast' // ✅ Import toast notifications

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()
    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

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
        <div className="min-h-screen flex justify-center items-center bg-[#8B0000]">
            <div className="w-full max-w-md">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4 bg-[#8B0000] text-white p-6 rounded-lg shadow-md"
                >
                    <h2 className="text-xl font-bold">Login</h2>

                    <label className="flex flex-col">
                        Username
                        <input
                            {...register('username', {
                                required: 'Username is required',
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
                        Password
                        <input
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
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
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginForm
