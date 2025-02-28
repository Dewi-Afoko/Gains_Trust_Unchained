import { useState, useEffect, useRef } from 'react'
import SetActionsLive from './SetActionsLive'
import { formatLoading } from '../../lib/utils'

const TimerLive = ({ nextSet, restTime, startRestTimer }) => {
    const [timeLeft, setTimeLeft] = useState(restTime)
    const [activeRest, setActiveRest] = useState(false)
    const startTimeRef = useRef(null)
    const intervalRef = useRef(null)

    // ✅ Function to start the timer
    const handleStartRest = (newRestTime) => {
        console.log(`🔔 New rest timer started: ${newRestTime}s`)
        setTimeLeft(newRestTime)
        startTimeRef.current = Date.now()
        setActiveRest(true)

        // ✅ Clear any existing interval to avoid multiple timers running
        if (intervalRef.current) clearInterval(intervalRef.current)

        // ✅ Start a new countdown interval
        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
            const remaining = Math.max(newRestTime - elapsed, 0)
            setTimeLeft(remaining)

            if (remaining === 0) {
                clearInterval(intervalRef.current)
                setActiveRest(false)
            }
        }, 1000)
    }

    // ✅ Ensure timer syncs properly when tab regains focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && activeRest) {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
                const remaining = Math.max(restTime - elapsed, 0)
                setTimeLeft(remaining)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [activeRest, restTime])

    return (
        <div className="bg-[#400000] text-white p-8 rounded-xl shadow-lg mb-6 border border-yellow-400 w-full max-w-[900px] mx-auto text-center">
            <h2 className="text-6xl font-extrabold text-stroke">
                {activeRest ? (
                    <>
                        ⏳{' '}
                        <span className="animate-pulse">Rest Up, Comrade!</span>{' '}
                        ⌛️
                        <br />
                        <span
                            className={
                                timeLeft <= 5
                                    ? 'text-red-700 text-7xl font-extrabold animate-shake'
                                    : 'text-yellow-400'
                            }
                        >
                            <br />
                            Next Set In: {timeLeft}s
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-yellow-400 text-7xl animate-bounce">
                            ⛓️‍💥 Time to Smash: ⛓️‍💥
                        </span>
                        <br />
                        <br />
                        <span className="text-6xl font-extrabold text-stroke">
                            🔥 {nextSet?.exercise_name || 'Next Set'} 🔥
                            <br />
                        </span>
                    </>
                )}
            </h2>

            {/* ✅ Display next set details during rest */}
            {activeRest && nextSet && (
                <div className="mt-4 p-4 bg-[#500000] rounded-lg border border-yellow-400 shadow-md">
                    <h3 className="text-2xl font-bold text-yellow-300">
                        Up Next: {nextSet.exercise_name}
                    </h3>
                    <p className="text-2xl font-extrabold text-stroke mt-2">
                        {formatLoading(nextSet.loading)} X {nextSet.reps} reps
                    </p>
                    <p className="text-lg font-extrabold text-stroke">
                        ({nextSet.exercise_name} - Set {nextSet.set_number})
                    </p>
                    {nextSet.notes && (
                        <p className="text-sm font-extrabold text-stroke mt-2">
                            Notes: {nextSet.notes}
                        </p>
                    )}
                </div>
            )}

            {/* ✅ Display full details of next set when not resting */}
            {!activeRest && nextSet && (
                <div className="mt-6 text-xl text-yellow-300">
                    <p className="text-4xl font-extrabold text-stroke">
                        {formatLoading(nextSet.loading)} X {nextSet.reps} reps
                    </p>
                    <p className="text-1xl font-extrabold text-stroke">
                        ({nextSet.exercise_name} Set Number: {nextSet.set_number})
                    </p>
                    <br />
                    {nextSet.notes && (
                        <p className="text-1xl font-extrabold text-stroke">
                            Performance Notes:
                            <br /> {nextSet.notes}
                        </p>
                    )}
                </div>
            )}

            {/* ✅ Centered Action Buttons */}
            {!activeRest && nextSet && (
                <div className="mt-6 flex justify-center">
                    <SetActionsLive
                        setId={nextSet.id}
                        isNextSet={true}
                        restTime={nextSet.rest}
                        startRestTimer={handleStartRest} // ✅ Ensure timer starts properly
                    />
                </div>
            )}
        </div>
    )
}

export default TimerLive
