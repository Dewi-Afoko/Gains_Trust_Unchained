import axios from 'axios'

const SetActionsLive = ({
    workoutId,
    setId,
    isNextSet,
    restTime,
    onSetUpdated,
    startRestTimer,
    accessToken,
}) => {
    console.log(`🔍 Set ${setId} | isNextSet: ${isNextSet}`)

    // ✅ Mark Set as Complete
    const handleComplete = async () => {
        if (!isNextSet) return
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/complete/`,
                {},
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            onSetUpdated() // 🔄 Refresh sets
            startRestTimer(restTime) // ⏳ Start rest countdown
        } catch (error) {
            console.error('❌ Error marking set complete:', error)
        }
    }

    // ✅ Skip Set (Moves to End)
    const handleSkip = async () => {
        if (!isNextSet) return
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/skip/`,
                {},
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            onSetUpdated() // 🔄 Refresh sets
        } catch (error) {
            console.error('❌ Error skipping set:', error)
        }
    }

    return (
        <div className="flex space-x-2">
            <button
                onClick={() => {
                    handleComplete()
                    startRestTimer(restTime) // ✅ Now updates TimerLive
                }}
                disabled={!isNextSet}
                className={`px-3 py-1 rounded transition text-black ${
                    isNextSet
                        ? 'bg-green-500 hover:bg-green-400'
                        : 'bg-gray-500 cursor-not-allowed'
                }`}
            >
                💯 Complete
            </button>

            <button
                onClick={handleSkip}
                disabled={!isNextSet}
                className={`px-3 py-1 rounded transition text-black ${
                    isNextSet
                        ? 'bg-yellow-500 hover:bg-yellow-400'
                        : 'bg-gray-500 cursor-not-allowed'
                }`}
            >
                ⏭ Skip
            </button>
        </div>
    )
}

export default SetActionsLive
