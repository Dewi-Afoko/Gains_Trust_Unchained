import { useContext, useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import UserDetailsCard from '../components/UserDetailsCard'
import UserWeightCard from '../components/UserWeightsCard'
import WorkoutFeed from '../components/WorkoutFeed'
import WorkoutCreationForm from '../components/WorkoutCreationForm'
import WorkoutDetails from '../components/WorkoutDetails' // Import WorkoutDetails

const Dashboard = () => {
    const { accessToken } = useContext(AuthContext)
    const [user, setUser] = useState(null)
    const [weights, setWeights] = useState([])
    const [workoutId, setWorkoutId] = useState(null) // Store selected workoutId
    const [isModalOpen, setIsModalOpen] = useState(false) // Modal state
    const [isCreating, setIsCreating] = useState(false) // Track creating state
    const [isSubmitted, setIsSubmitted] = useState(false) // Track form submission state

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

    const handleOpenModal = () => setIsModalOpen(true)
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setIsSubmitted(false) // Reset after closing modal
    }

    return (
        <div className="pt-24 pb-20 flex flex-col items-center min-h-screen bg-[#8B0000] text-white">
            {user && <UserDetailsCard user={user} />}

            {/* Create Workout Button (only visible when form is closed) */}
            {!isModalOpen && !isCreating && !isSubmitted && !workoutId && (
                <button
                    onClick={handleOpenModal}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition mt-6"
                >
                    Create Workout
                </button>
            )}

            {/* Show Creating Workout Card when submitting */}
            {isCreating && (
                <div className="w-full max-w-md bg-yellow-400 text-black text-center p-3 mb-4 mt-6 rounded-lg shadow-md">
                    Creating workout...
                </div>
            )}

            {/* Modal for Workout Creation */}
            {isModalOpen && (
                <WorkoutCreationForm
                    onClose={handleCloseModal}
                    setIsCreating={setIsCreating}
                    setIsSubmitted={setIsSubmitted}
                />
            )}

            {/* Display WorkoutDetails if a workout is selected */}
            {workoutId && (
                <div className="mt-6 w-full max-w-6xl">
                    <WorkoutDetails workoutId={workoutId} />
                    <button
                        onClick={() => setWorkoutId(null)} // Reset to return to workout list
                        className="bg-red-500 text-black px-4 py-2 rounded mt-4 hover:bg-red-400 transition"
                    >
                        Back to Workout Feed
                    </button>
                </div>
            )}

            {/* Show Workout Feed & Weight Chart only if no workout is selected */}
            {!workoutId && (
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {weights.length > 0 && <UserWeightCard weights={weights} />}
                    <WorkoutFeed setWorkoutId={setWorkoutId} />{' '}
                    {/* Pass setWorkoutId */}
                </div>
            )}
        </div>
    )
}

export default Dashboard
