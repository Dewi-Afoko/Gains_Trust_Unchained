import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import UserDetailsCard from '../components/users/UserDetailsCard'
import UserWeightCard from '../components/users/UserWeightsCard'
import WorkoutFeedPreview from '../components/workouts/WorkoutFeedPreview'
import WorkoutDetailsPreview from '../components/workouts/WorkoutDetailsPreview'
import WorkoutOverview from '../components/livetracking/WorkoutOverview'
import { useAuthContext } from '../providers/AuthContext'
import { WorkoutProvider } from '../providers/WorkoutContext'
import { getWeights } from '../api/usersApi'

const Dashboard = () => {
    const { user } = useAuthContext()
    const [weights, setWeights] = useState([])
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null)
    const [showLiveWorkout, setShowLiveWorkout] = useState(false)
    const [loadingWeights, setLoadingWeights] = useState(true)
    const [error, setError] = useState(null)

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

    // Optionally, you could check for a live workout here and set showLiveWorkout
    // For now, we'll just show the WorkoutOverview if showLiveWorkout is true

    return (
        <WorkoutProvider>
            <div className="min-h-screen w-full bg-gradient-to-br from-[#1a1a1a] via-[#2d0000] to-[#0a0a0a] py-12 px-4 flex flex-col items-center">
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-8">
                        <UserDetailsCard />
                        {loadingWeights ? (
                            <Card className="w-full max-w-2xl bg-[#600000] border border-yellow-400 shadow-lg text-white flex items-center justify-center min-h-[200px]">
                                <CardContent>Loading weights...</CardContent>
                            </Card>
                        ) : error ? (
                            <Card className="w-full max-w-2xl bg-[#600000] border border-yellow-400 shadow-lg text-white flex items-center justify-center min-h-[200px]">
                                <CardContent>{error}</CardContent>
                            </Card>
                        ) : (
                            <UserWeightCard weights={weights} />
                        )}
                    </div>
                    <div className="flex flex-col gap-8">
                        <WorkoutFeedPreview setWorkoutId={setSelectedWorkoutId} />
                        {selectedWorkoutId && (
                            <WorkoutDetailsPreview workoutId={selectedWorkoutId} />
                        )}
                        {/* Optionally, show live workout overview if in progress */}
                        {showLiveWorkout && <WorkoutOverview />}
                    </div>
                </div>
            </div>
        </WorkoutProvider>
    )
}

export default Dashboard 