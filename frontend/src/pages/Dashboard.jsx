import React, { useEffect, useState } from 'react'
import UserDetailsCard from '../components/users/UserDetailsCard'
import UserWeightCard from '../components/users/UserWeightsCard'
import WorkoutFeedPreview from '../components/workouts/WorkoutFeedPreview'
import WorkoutDetailsPreview from '../components/workouts/WorkoutDetailsPreview'
import { useAuthContext } from '../providers/AuthContext'
import { WorkoutProvider } from '../providers/WorkoutContext'
import { getWeights } from '../api/usersApi'
import industrialTexture from '../assets/industrial-features-texture.png'

export default function Dashboard() {
    const { user } = useAuthContext()
    const [weights, setWeights] = useState([])
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null)
    const [loadingWeights, setLoadingWeights] = useState(true)
    const [error, setError] = useState(null)
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)

    useEffect(() => {
        const fetchWeights = async () => {
            setLoadingWeights(true)
            try {
                const data = await getWeights()
                setWeights(data.results || [])
            } catch (err) {
                setError('Failed to fetch weights')
            } finally {
                setLoadingWeights(false)
            }
        }
        fetchWeights()
    }, [])

    // Handler to open workout details (no modal)
    const handleWorkoutClick = (workoutId) => {
        setSelectedWorkoutId(workoutId)
        // No modal logic needed
    }

    // Handler to close modal
    const handleCloseModal = () => {
        setIsWorkoutModalOpen(false)
        setSelectedWorkoutId(null)
    }

    return (
        <WorkoutProvider workoutId={selectedWorkoutId}>
            <div className="min-h-screen w-full relative overflow-hidden">
                {/* Background Texture Layer */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none z-0"
                    style={{ backgroundImage: `url(${industrialTexture})` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-brand-dark-2/90 to-black/95 opacity-90 z-10"></div>
                {/* Main Content */}
                <div className="relative z-20 mx-auto px-6 py-24 sm:py-32 lg:max-w-[90rem] lg:px-8">
                    {/* Main 3-column grid, align bottoms */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                        {/* User Details (tall) */}
                        <div className="h-[500px] min-h-[400px] w-full bg-brand-dark-2 border border-brand-gold shadow-lg rounded-[2rem] flex flex-col p-6 sm:p-10 text-white">
                            <UserDetailsCard />
                        </div>
                        {/* Center: header + workouts (shorter) */}
                        <div className="flex flex-col items-center w-full h-full">
                            <div className="w-full flex flex-col items-center justify-center text-center flex-shrink-0" style={{ minHeight: '120px' }}>
                                <h2 className="text-base font-semibold text-brand-gold tracking-widest uppercase mb-2 mt-2">
                                    Dashboard
                                </h2>
                                <p className="mx-auto max-w-lg text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
                                    Welcome to your Gains Trust Dashboard
                                </p>
                            </div>
                            <div className="w-full flex-1 bg-brand-dark-2 border border-brand-gold shadow-lg rounded-2xl flex flex-col overflow-hidden p-6 sm:p-10 text-white min-h-[180px] max-h-[320px] justify-center">
                                <WorkoutFeedPreview setWorkoutId={handleWorkoutClick} maxHeight="200px" />
                            </div>
                        </div>
                        {/* Weight Tracking (tall) */}
                        <div className="h-[500px] min-h-[400px] w-full bg-brand-dark-2 border border-brand-gold shadow-lg rounded-[2rem] flex flex-col p-6 sm:p-10 text-white">
                            <UserWeightCard weights={weights} />
                        </div>
                    </div>

                    {/* Full-width: Workout Details Preview */}
                    <div className="mt-10 w-full bg-brand-dark-2 border border-brand-gold shadow-lg rounded-2xl flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] md:min-h-[500px] p-6 sm:p-10 text-white">
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            {selectedWorkoutId ? (
                                <WorkoutDetailsPreview workoutId={selectedWorkoutId} />
                            ) : (
                                <span className="text-center">Select a workout to see details</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </WorkoutProvider>
    )
}
