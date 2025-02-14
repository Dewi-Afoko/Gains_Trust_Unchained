import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext)

    // Show a loading state while waiting for user to load
    if (user === null) {
        return <p className="text-white text-center">Loading...</p>
    }

    return user ? children : <Navigate to="/login" />
}

export default PrivateRoute
