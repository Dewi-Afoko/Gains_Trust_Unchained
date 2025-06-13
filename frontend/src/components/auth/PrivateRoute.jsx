import { Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import LoadingSpinner from '../ui/LoadingSpinner'

const PrivateRoute = ({ children }) => {
    const { user, isLoading } = useAuthStore()

    if (isLoading) {
        return <LoadingSpinner />
    }

    return user ? children : <Navigate to="/login" />
}

export default PrivateRoute
