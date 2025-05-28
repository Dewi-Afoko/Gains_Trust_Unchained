import { create } from 'zustand'
import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const useAuthStore = create((set, get) => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isLoading: true,

    refreshAccessToken: async () => {
        const refreshToken = get().refreshToken
        if (!refreshToken) {
            get().logout()
            return null
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/token/refresh/`,
                {
                    refresh: refreshToken,
                }
            )

            const newAccessToken = response.data.access
            set({ accessToken: newAccessToken })
            localStorage.setItem('accessToken', newAccessToken)

            if (response.data.refresh) {
                set({ refreshToken: response.data.refresh })
                localStorage.setItem('refreshToken', response.data.refresh)
            }

            return newAccessToken
        } catch (error) {
            get().logout()
            return null
        }
    },

    login: (userData, access, refresh) => {
        set({
            user: userData,
            accessToken: access,
            refreshToken: refresh,
            isLoading: false
        })
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
    },

    logout: () => {
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false
        })
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    },

    fetchUser: async () => {
        const { accessToken } = get()
        if (!accessToken) {
            set({ isLoading: false })
            return
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/users/me/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })

            set({ user: response.data, isLoading: false })
        } catch (error) {
            if (error.response?.status === 401) {
                const newAccessToken = await get().refreshAccessToken()
                if (newAccessToken) {
                    get().fetchUser()
                } else {
                    set({ isLoading: false })
                }
            } else {
                set({ isLoading: false })
            }
        }
    }
}))

export default useAuthStore 