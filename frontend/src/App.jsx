import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import Navbar from './components/ui/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import WorkoutsList from './pages/WorkoutsList'
import WorkoutDetails from './pages/WorkoutDetails'
import LiveTracking from './pages/LiveTracking'
import PasswordResetRequest from './components/auth/PasswordResetRequest'
import PasswordResetConfirm from './components/auth/PasswordResetConfirm'
import PrivateRoute from './components/auth/PrivateRoute'
import useAuthStore from './stores/authStore'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
})

function App() {
    const { initAuth } = useAuthStore()

    useEffect(() => {
        initAuth()
    }, [initAuth])

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-brand-dark">
                <Toaster richColors />
                <Navbar />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/forgot-password"
                        element={<PasswordResetRequest />}
                    />
                    <Route
                        path="/reset-password/:token"
                        element={<PasswordResetConfirm />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/workouts"
                        element={
                            <PrivateRoute>
                                <WorkoutsList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/workouts/:id"
                        element={
                            <PrivateRoute>
                                <WorkoutDetails />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/livetracking/:id"
                        element={
                            <PrivateRoute>
                                <LiveTracking />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </QueryClientProvider>
    )
}

export default App
