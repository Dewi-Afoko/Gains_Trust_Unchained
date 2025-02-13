import { Link, useNavigate } from 'react-router-dom'

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setIsLoggedIn(false)
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

                {/* Show Login/Register if NOT logged in */}
                {!isLoggedIn ? (
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
                ) : (
                    // Show Logout if logged in
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
