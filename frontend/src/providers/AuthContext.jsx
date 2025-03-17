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

    const refreshAccessToken = async () => {
        if (!refreshToken) {
            logout() // No refresh token available → Force logout
            return null
        }
    
        try {
            const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
            })
    
            const newAccessToken = response.data.access
            setAccessToken(newAccessToken)
            localStorage.setItem('accessToken', newAccessToken)
    
            // 🛠️ Store new refresh token if API provides it
            if (response.data.refresh) {
                setRefreshToken(response.data.refresh)
                localStorage.setItem('refreshToken', response.data.refresh)
            }
    
            return newAccessToken
        } catch (error) {
            logout() // Refresh failed → Force logout
            return null
        }
    }
    
    

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

    const fetchUser = async () => {
        if (!accessToken) return
    
        try {
            const response = await axios.get(`${API_BASE_URL}/users/me/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
    
            setUser(response.data.user)
        } catch (error) {
            if (error.response?.status === 401) { // 401 = Unauthorized (Token likely expired)
                const newAccessToken = await refreshAccessToken()
                if (newAccessToken) {
                    fetchUser() // Retry fetching user with new token
                }
            }
        }
    }
    

    useEffect(() => {
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
