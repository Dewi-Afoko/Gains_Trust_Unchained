import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem('accessToken')
    )
    const [refreshToken, setRefreshToken] = useState(
        localStorage.getItem('refreshToken')
    )

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

    const login = (userData, access, refresh) => {
        setUser(userData)
        setAccessToken(access)
        setRefreshToken(refresh)
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
    }

    const logout = () => {
        setUser(null)
        setAccessToken(null)
        setRefreshToken(null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    }

    useEffect(() => {
        const fetchUser = async () => {
            if (!accessToken) return

            try {
                const response = await axios.get(`${API_BASE_URL}/users/me/`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })

                setUser(response.data.user)
            } catch (error) {
                logout() // Only logout if there's a real authentication issue
            }
        }

        fetchUser()
    }, [accessToken])

    return (
        <AuthContext.Provider
            value={{ user, setUser, accessToken, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}
