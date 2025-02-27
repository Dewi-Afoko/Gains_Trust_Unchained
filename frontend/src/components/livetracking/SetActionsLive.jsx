import { useState } from 'react'
import { useWorkoutContext } from '../../context/WorkoutContext' // ✅ Keep context

const SetActionsLive = ({ setId, isNextSet, restTime, startRestTimer }) => {
    const { workoutId, toggleSetComplete, skipSet } = useWorkoutContext() // ✅ Keep context functions
    const [loading, setLoading] = useState(false)

    const handleComplete = async () => {
        if (!isNextSet) return // ✅ Prevent completing the wrong set
        setLoading(true)

        console.log('🟢 Completing set. Set ID:', setId) // ✅ Debugging log

        if (!setId) {
            console.error(
                '❌ ERROR: Attempted to complete a set with an undefined setId.'
            )
            setLoading(false)
            return
        }

        try {
            await toggleSetComplete(setId)
            startRestTimer(restTime)
        } catch (error) {
            console.error('❌ Error marking set complete:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = async () => {
        if (!isNextSet) return // ✅ Prevent skipping the wrong set
        setLoading(true)

        console.log('⚠️ Skipping set. Set ID:', setId) // ✅ Debugging log

        if (!setId) {
            console.error(
                '❌ ERROR: Attempted to skip a set with an undefined setId.'
            )
            setLoading(false)
            return
        }

        try {
            await skipSet(setId)
        } catch (error) {
            console.error('❌ Error skipping set:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-between mt-4">
            <button
                onClick={handleComplete}
                disabled={!isNextSet || loading}
                className={`px-4 py-2 rounded-xl font-bold text-white transition text-stroke ${
                    isNextSet
                        ? 'bg-[#222222] hover:bg-[#333333]'
                        : 'bg-gray-700 cursor-not-allowed'
                }`}
            >
                {loading ? '⏳ Processing...' : '🔥 Complete'}
            </button>

            <button
                onClick={handleSkip}
                disabled={!isNextSet || loading}
                className={`px-4 py-2 rounded-xl font-bold text-white transition text-stroke ${
                    isNextSet
                        ? 'bg-[#B22222] hover:bg-[#8B0000]'
                        : 'bg-gray-700 cursor-not-allowed'
                }`}
            >
                {loading ? '⏳ Processing...' : '⏭ Skip'}
            </button>
        </div>
    )
}

export default SetActionsLive
