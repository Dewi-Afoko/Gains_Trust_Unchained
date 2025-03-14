import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../../providers/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext)
    return user === null ? (
        <LoadingSpinner />
    ) : user ? (
        children
    ) : (
        <Navigate to="/login" />
    )
}

export default PrivateRoute
