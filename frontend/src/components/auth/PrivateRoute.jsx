import { Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import LoadingSpinner from '../ui/LoadingSpinner'

const PrivateRoute = ({ children }) => {
    const { user } = useAuthStore()
    return user === null ? (
        <LoadingSpinner />
    ) : user ? (
        children
    ) : (
        <Navigate to="/login" />
    )
}

export default PrivateRoute
