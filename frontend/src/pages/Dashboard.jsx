import { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import UserDetailsCard from '../components/UserDetailsCard'
import UserWeightCard from '../components/UserWeightsCard'
import WorkoutFeed from '../components/WorkoutFeed'

const Dashboard = () => {
    const { accessToken } = useContext(AuthContext)
    const [user, setUser] = useState(null)
    const [weights, setWeights] = useState([])

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/users/me/`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error('❌ Failed to fetch user details')
                }

                const data = await response.json()
                setUser(data.user)
                setWeights(data.weights.slice(-10)) // Last 10 weigh-ins
            } catch (error) {
                console.error('❌ Error fetching user details:', error)
            }
        }

        fetchUserDetails()
    }, [accessToken])

    return (
        <div className="pt-24 pb-20 flex flex-col items-center min-h-screen bg-[#8B0000] text-white">
            {user && <UserDetailsCard user={user} />}
            
            {/* Grid layout for Workout Feed & Weight Chart */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {weights.length > 0 && <UserWeightCard weights={weights} />}
                <WorkoutFeed />
            </div>
        </div>
    );
    
}

export default Dashboard
