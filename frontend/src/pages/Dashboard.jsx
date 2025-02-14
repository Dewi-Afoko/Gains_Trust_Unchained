import { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import UserDetailsCard from '../components/UserDetailsCard'
import UserWeightCard from '../components/UserWeightsCard'

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
        <div className="pt-24 pb-20 flex flex-col items-center min-h-screen bg-[#8B0000] text-white space-y-6">
            {user && <UserDetailsCard user={user} />}
            {weights.length > 0 && <UserWeightCard weights={weights} />}
        </div>
    )
}

export default Dashboard
