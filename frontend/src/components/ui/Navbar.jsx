import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuthStore from '../../stores/authStore'
import useWorkoutStore from '../../stores/workoutStore'
import { LucideChevronDown, LucideChevronUp } from 'lucide-react'
import logo from '../../assets/gains-trust-logo-final.png'

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuthStore()
    const { workouts, fetchAllWorkouts } = useWorkoutStore()
    const [trackerDropdownOpen, setTrackerDropdownOpen] = useState(false)

    // Fetch workouts when user is authenticated and component mounts
    useEffect(() => {
        if (user) {
            fetchAllWorkouts()
        }
    }, [user, fetchAllWorkouts])

    // Close dropdown when route changes
    useEffect(() => {
        setTrackerDropdownOpen(false)
    }, [location.pathname])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleWorkoutClick = (workoutId) => {
        setTrackerDropdownOpen(false) // Close dropdown immediately
        navigate(`/livetracking/${workoutId}`)
    }

    return (
        <>
            <nav className="bg-[#222] text-white p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50 shadow-lg border-b border-yellow-600">
                {/* Logo / Home Link */}
                <div className="flex items-center space-x-3 pl-6">
                    <img
                        src={logo}
                        alt="Gains Trust Logo"
                        className="w-16 h-16"
                    />
                    <Link
                        to="/"
                        className="text-2xl bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700
                    text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] gains-font"
                    >
                        Gains Trust
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="space-x-6 pr-6 flex items-center">
                    <Link
                        to="/"
                        className="hover:text-yellow-300 transition duration-200"
                    >
                        Home
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="hover:text-yellow-300 transition duration-200"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/workouts"
                                className="hover:text-yellow-300 transition duration-200"
                            >
                                My Workouts
                            </Link>

                            {/* Enhanced Live Workout Tracker Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setTrackerDropdownOpen(
                                            !trackerDropdownOpen
                                        )
                                    }
                                    className="flex items-center bg-transparent border-none outline-none hover:text-yellow-300 transition duration-200 px-0 py-0 group"
                                    style={{ font: 'inherit' }}
                                >
                                    Live Tracker{' '}
                                    {/* Badge showing workout count */}
                                    {workouts?.length > 0 && (
                                        <span className="ml-2 bg-yellow-600 text-black text-xs px-2 py-1 rounded-full font-bold">
                                            {workouts.length}
                                        </span>
                                    )}
                                    {trackerDropdownOpen ? (
                                        <LucideChevronUp className="ml-1 w-4 h-4 group-hover:text-yellow-300" />
                                    ) : (
                                        <LucideChevronDown className="ml-1 w-4 h-4 group-hover:text-yellow-300" />
                                    )}
                                </button>

                                {/* Enhanced Scrollable Dropdown */}
                                {trackerDropdownOpen && (
                                    <div className="absolute left-0 mt-2 bg-[#333] text-white border border-red-800 rounded shadow-lg w-64 max-h-[300px] overflow-y-auto z-50">
                                        {workouts?.length > 0 ? (
                                            <>
                                                <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-600 uppercase tracking-wider font-medium">
                                                    Select Workout to Track
                                                </div>
                                                {workouts.map((workout) => (
                                                    <button
                                                        key={workout.id}
                                                        onClick={() =>
                                                            handleWorkoutClick(
                                                                workout.id
                                                            )
                                                        }
                                                        className="w-full text-left px-4 py-3 hover:bg-red-800 transition border-b border-gray-700 last:border-b-0 group"
                                                    >
                                                        <div className="font-medium text-white group-hover:text-yellow-300 transition">
                                                            {
                                                                workout.workout_name
                                                            }
                                                        </div>
                                                        {workout.duration ? (
                                                            <div className="text-xs text-yellow-400 mt-1">
                                                                ✓ Completed
                                                            </div>
                                                        ) : workout.start_time ? (
                                                            <div className="text-xs text-green-400 mt-1">
                                                                ● In Progress
                                                            </div>
                                                        ) : null}
                                                    </button>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-4 py-6 text-center">
                                                <p className="text-gray-400 mb-2">
                                                    No workouts available
                                                </p>
                                                <Link
                                                    to="/workouts"
                                                    onClick={() =>
                                                        setTrackerDropdownOpen(
                                                            false
                                                        )
                                                    }
                                                    className="text-yellow-400 hover:text-yellow-300 underline text-sm"
                                                >
                                                    Create a workout first
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-transparent border-none outline-none hover:text-yellow-300 transition duration-200 px-0 py-0"
                                style={{ font: 'inherit' }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="hover:text-yellow-300 transition duration-200"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="hover:text-yellow-300 transition duration-200"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
            {/* Buffer below navbar to prevent content overlap */}
            <div className="w-full" style={{ height: '96px' }}></div>
        </>
    )
}

export default Navbar
