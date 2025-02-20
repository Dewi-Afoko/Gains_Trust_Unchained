import { useState, useEffect } from 'react'
import SetActionsLive from './SetActionsLive'

const TimerLive = ({
    nextSet,
    restTime,
    workoutId,
    accessToken,
    startRestTimer,
    onSetUpdated,
}) => {
    const [timeLeft, setTimeLeft] = useState(restTime)
    const [activeRest, setActiveRest] = useState(false)

    // ✅ Reset timer when restTime changes
    useEffect(() => {
        if (restTime > 0) {
            console.log(`🔔 New rest timer started: ${restTime}s`)
            setTimeLeft(restTime)
            setActiveRest(true)
        }
    }, [restTime]) // ✅ This now updates the timer when a new set is completed

    // ✅ Countdown Logic
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
            }, 1000)
            return () => clearInterval(timer)
        } else {
            setActiveRest(false)
        }
    }, [timeLeft])

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

            {/* ✅ Display full details of next set */}
            {!activeRest && nextSet && (
                <div className="mt-6 text-xl text-yellow-300">
                    <p className="text-4xl font-extrabold text-stroke">
                        {nextSet.loading}kg X {nextSet.reps} reps
                    </p>
                    <p className="text-1xl font-extrabold text-stroke">
                        ({nextSet.exercise_name} Set Number:{' '}
                        {nextSet.set_number})
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
                        workoutId={workoutId}
                        accessToken={accessToken}
                        isNextSet={true}
                        restTime={nextSet.rest}
                        startRestTimer={startRestTimer}
                        onSetUpdated={onSetUpdated}
                    />
                </div>
            )}
        </div>
    )
}

export default TimerLive
