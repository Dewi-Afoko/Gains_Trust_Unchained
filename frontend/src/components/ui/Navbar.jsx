import { Link, useNavigate } from 'react-router-dom'
import { useContext, useState, useEffect } from 'react'
import AuthContext from '../../providers/AuthContext'
import axios from 'axios'
import { LucideChevronDown, LucideChevronUp } from 'lucide-react'
import logo from '../../assets/gains-trust-logo-final.png'


const Navbar = () => {
    const navigate = useNavigate()
    const { user, accessToken, logout } = useContext(AuthContext)
    const [workouts, setWorkouts] = useState([])
    const [trackerDropdownOpen, setTrackerDropdownOpen] = useState(false)

    useEffect(() => {
        if (accessToken) {
            fetchWorkouts()
        }
    }, [accessToken])

    const fetchWorkouts = async () => {
        if (!accessToken) return

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
        <nav className="bg-[#222] text-white p-4 flex justify-between items-center fixed top-0 left-0 w-full z-50 shadow-lg border-b border-yellow-600">

            {/* Logo / Home Link */}
            <div className="flex items-center space-x-3 pl-6">
                <img src={logo} alt="Gains Trust Logo" className="w-16 h-16" />
                <Link to="/" className="text-2xl font-bold tracking-wide uppercase hover:text-yellow-300 transition duration-200">
                    Gains Trust
                </Link>
            </div>


            {/* Navigation Links */}
            <div className="space-x-6 pr-6 flex items-center">
                <Link to="/" className="hover:text-yellow-300 transition duration-200">
                    Home
                </Link>

                {user ? (
                    <>
                        <Link to="/dashboard" className="hover:text-yellow-300 transition duration-200">
                            Dashboard
                        </Link>
                        <Link to="/workouts" className="hover:text-yellow-300 transition duration-200">
                            My Workouts
                        </Link>

                        {/* Live Workout Tracker Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setTrackerDropdownOpen(!trackerDropdownOpen)}
                                className="flex items-center hover:text-yellow-300 transition duration-200"
                            >
                                Live Tracker {trackerDropdownOpen ? <LucideChevronUp className="ml-1 w-4 h-4" /> : <LucideChevronDown className="ml-1 w-4 h-4" />}
                            </button>

                            {/* Scrollable Dropdown */}
                            {trackerDropdownOpen && (
                                <div className="absolute left-0 mt-2 bg-[#333] text-white border border-red-800 rounded shadow-lg w-56 max-h-[250px] overflow-y-auto">
                                    {workouts?.length > 0 ? (
                                        workouts.map((workout) => (
                                            <Link key={workout.id} to={`/livetracking/${workout.id}`} className="block px-4 py-2 hover:bg-red-800 transition">
                                                {workout.workout_name}
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center px-4 py-2">No active workouts</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hover:text-yellow-300 transition duration-200">
                            Login
                        </Link>
                        <Link to="/register" className="hover:text-yellow-300 transition duration-200">
                            Register
                        </Link>
                    </>
                )}

                {user && (
                    <button onClick={handleLogout} className="hover:text-yellow-300 transition duration-200">
                        Logout
                    </button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
