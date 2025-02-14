import { createContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(null)
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem('accessToken')
    )
    const [refreshToken, setRefreshToken] = useState(
        localStorage.getItem('refreshToken')
    )

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

    // Function to handle login
    const login = (userData, access, refresh) => {
        setUserState(userData)
        setAccessToken(access)
        setRefreshToken(refresh)
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
        localStorage.setItem('user', JSON.stringify(userData)) // Persist user data
    }

    // Function to handle logout
    const logout = () => {
        setUserState(null)
        setAccessToken(null)
        setRefreshToken(null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
    }

    // Fetch user details on load
    useEffect(() => {
        const fetchUser = async () => {
            if (!accessToken) {
                return
            }

            try {
                const response = await fetch(`${API_BASE_URL}/users/me/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })

                if (!response.ok) {
                    console.log('Have you changed what /users/me/ returns?')
                    throw new Error('❌ Failed to fetch user details')
                }

                const data = await response.json()
                setUserState(data.user)
                localStorage.setItem('user', JSON.stringify(data.user)) // Persist user in storage
            } catch (error) {
                logout()
            }
        }

        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUserState(JSON.parse(storedUser))
        } else {
            fetchUser()
        }
    }, [accessToken])

    // Ensure the setUser function updates localStorage
    const setUser = (newUser) => {
        setUserState(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
    }

    return (
        <AuthContext.Provider
            value={{ user, setUser, accessToken, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
