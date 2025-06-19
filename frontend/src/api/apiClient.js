import axios from 'axios'

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
})

// Attach token if present
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

// Global response interceptor for refresh token logic
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/token/refresh/')
        ) {
            originalRequest._retry = true
            if (isRefreshing) {
                // Queue the request until refresh is done
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] =
                            'Bearer ' + token
                        return apiClient(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }
            isRefreshing = true
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
                // No refresh token, just reject (don't reload or clear tokens)
                return Promise.reject(error)
            }
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL || '/api'}/token/refresh/`,
                    { refresh: refreshToken }
                )
                const newAccessToken = response.data.access
                localStorage.setItem('accessToken', newAccessToken)
                processQueue(null, newAccessToken)
                originalRequest.headers['Authorization'] =
                    'Bearer ' + newAccessToken
                return apiClient(originalRequest)
            } catch (err) {
                processQueue(err, null)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                window.location.reload()
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
