import { Link, useNavigate } from 'react-router-dom'
import { useContext, useState, useEffect } from 'react'
import AuthContext from '../../context/AuthContext' // ✅ Correct Import
import axios from 'axios'

const Navbar = () => {
    const navigate = useNavigate()
    const { user, accessToken, logout } = useContext(AuthContext) // ✅ Extract `accessToken`
    const [workouts, setWorkouts] = useState([])
    const [trackerDropdownOpen, setTrackerDropdownOpen] = useState(false) // ✅ New dropdown state

    useEffect(() => {
        if (accessToken) {
            fetchWorkouts()
        }
    }, [accessToken])

    const fetchWorkouts = async () => {
        if (!accessToken) {
            return
        }

        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            setWorkouts(response.data.workouts || [])
        } catch (error) {
            console.error('❌ Error fetching workouts:', error)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <nav className="bg-[#8B0000] text-white p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50 shadow-md">
            {/* Logo / Home Link */}
            <div className="text-2xl font-bold tracking-wide uppercase pl-6">
                <Link
                    to="/"
                    className="hover:text-yellow-300 transition duration-200"
                >
                    Gains Trust
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="space-x-6 pr-6">
                <Link
                    to="/"
                    className="text-yellow-400 font-semibold hover:text-yellow-300 hover:underline transition duration-200"
                >
                    Home
                </Link>

                {user ? (
                    <>
                        <Link
                            to="/dashboard"
                            className="text-yellow-400 font-semibold hover:text-yellow-300 hover:underline transition duration-200"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/workouts"
                            className="text-yellow-400 font-semibold hover:text-yellow-300 hover:underline transition duration-200"
                        >
                            My Workouts
                        </Link>

                        {/* 📌 Live Workout Tracker Dropdown */}
                        <div className="relative inline-block">
                            <button
                                onClick={() =>
                                    setTrackerDropdownOpen(!trackerDropdownOpen)
                                }
                                className="text-yellow-400 font-semibold hover:text-yellow-300 hover:underline transition duration-200"
                            >
                                Live Workout Tracker{' '}
                                {trackerDropdownOpen ? '🔽' : '▶️'}
                            </button>

                            {/* 🏋🏾‍♂️ Scrollable Dropdown Menu */}
                            {trackerDropdownOpen && (
                                <div className="absolute left-0 mt-2 bg-[#600000] text-white border border-yellow-400 rounded shadow-lg w-56 max-h-[250px] overflow-y-auto">
                                    {workouts.length > 0 ? (
                                        workouts.map((workout) => (
                                            <Link
                                                key={workout.id}
                                                to={`/livetracking/${workout.id}`}
                                                className="block px-4 py-2 hover:bg-[#700000] transition"
                                            >
                                                {workout.workout_name}
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center px-4 py-2">
                                            No active workouts
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="text-yellow-400 font-semibold hover:text-yellow-300 hover:underline transition duration-200"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="text-yellow-400 font-semibold hover:text-yellow-300 hover:underline transition duration-200"
                        >
                            Register
                        </Link>
                    </>
                )}

                {user && (
                    <button
                        onClick={handleLogout}
                        className="text-yellow-400 font-semibold hover:text-yellow-300 hover:underline transition duration-200"
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
