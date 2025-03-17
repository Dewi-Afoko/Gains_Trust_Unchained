import { Routes, Route } from 'react-router-dom'
import Navbar from './components/ui/Navbar'
import Footer from './components/ui/Footer'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'

function App() {
    return (
        <>
            <Toaster
                position="top-center" // ✅ Positioned slightly below the top-center
                reverseOrder={false}
                containerStyle={{
                    top: '25%', // ✅ Moves it down slightly
                    transform: 'translateY(-50px)',
                }}
                toastOptions={{
                    duration: 1000, // ✅ Keeps toasts visible longer
                    style: {
                        background: '#600000', // 🔥 Dark red background
                        color: '#FFD700', // 🟡 Gold/yellow text
                        border: '2px solid #B8860B', // Dark gold border
                        padding: '12px',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        textAlign: 'center',
                        animation: 'ease-in-out', // ✅ Wobble + Pulse Animation
                    },
                    success: {
                        icon: '🔥',
                        style: {
                            background: '#400000', // ✅ Darker red for success
                            color: '#FFD700',
                        },
                    },
                    error: {
                        icon: '⚠️',
                        style: {
                            background: '#8B0000', // ❌ Darkest red for errors
                            color: '#FFD700',
                        },
                    },
                }}
            />
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
            </Routes>

            <Footer />
        </>
    )
}

export default App
