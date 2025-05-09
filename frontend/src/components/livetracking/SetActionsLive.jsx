import { useState } from 'react'
import { useWorkoutContext } from '../../context/WorkoutContext' // ✅ Keep context
import PanelButton from '../ui/PanelButton'

const SetActionsLive = ({
    setId,
    isNextSet,
    restTime,
    startRestTimer,
    resetSetTimer,
}) => {
    const {
        workoutId,
        workout,
        timeElapsed,
        toggleSetComplete,
        skipSet,
        startWorkout,
        toggleComplete,
        incompleteSets,
    } = useWorkoutContext()
    const [loading, setLoading] = useState(false)
    const isRunning = timeElapsed > 0 // ✅ Workout is running if timeElapsed is greater than zero
    const isFinalSet = (incompleteSets?.length || 0) === 1 // ✅ If only 1 set remains, it's the final set

    const handleStartWorkout = async () => {
        await startWorkout(workoutId)
    }

    const handleComplete = async () => {
        if (!isNextSet || !isRunning) return // ✅ Prevent if not the next set or timer inactive
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

    const handleCompleteFinalSetAndWorkout = async () => {
        if (!isNextSet || !isRunning) return // ✅ Prevent if not the next set or workout isn't active
        setLoading(true)

        console.log(
            '🏁 Completing final set & marking workout complete. Set ID:',
            setId
        ) // ✅ Debugging log

        if (!setId) {
            console.error(
                '❌ ERROR: Attempted to complete a final set with an undefined setId.'
            )
            setLoading(false)
            return
        }

        try {
            await toggleSetComplete(setId) // ✅ Mark set as complete
            await toggleComplete(workoutId) // ✅ Mark workout as complete
        } catch (error) {
            console.error(
                '❌ Error marking final set & workout complete:',
                error
            )
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = async () => {
        if (!isNextSet || !isRunning) return // ✅ Prevent if not the next set or timer inactive
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
            resetSetTimer(true) // 🔥 Reset set duration timer before skipping the set
            await skipSet(setId)
        } catch (error) {
            console.error('❌ Error skipping set:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex flex-col items-center mt-6 w-full">
            {/* ▶ Start Workout Button (Shown if Workout Hasn't Started) */}
            {!isRunning && (
                <PanelButton onClick={handleStartWorkout} variant="gold">
                    ▶ Start Workout
                </PanelButton>
            )}

            {/* 🏁 Complete Final Set & Workout Button (Shown on Final Set) */}
            {isRunning && isFinalSet && (
                <PanelButton onClick={handleCompleteFinalSetAndWorkout} disabled={!isNextSet || loading} variant="gold" className="animate-pulse">
                    {loading ? '⏳ Processing...' : '🏁 Complete Final Set & Workout!'}
                </PanelButton>
            )}

            {/* 🔥 Complete Set Button (Shown on All Other Sets) */}
            {isRunning && !isFinalSet && (
                <PanelButton onClick={handleComplete} disabled={!isNextSet || loading} variant="gold">
                    {loading ? '⏳ Processing...' : '🔥 Complete'}
                </PanelButton>
            )}

            {/* ⏭ Skip Button - Bottom Right */}
            <div className="absolute bottom-0 right-0">
                <PanelButton onClick={handleSkip} disabled={!isNextSet || !isRunning || loading} variant="danger" className="px-4 py-2 w-auto">
                    {loading ? '⏳ Processing...' : '⏭ Skip'}
                </PanelButton>
            </div>
        </div>
    )
}

export default SetActionsLive
