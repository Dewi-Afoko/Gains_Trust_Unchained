import { useState, useEffect } from 'react'
import SetActionsLive from './SetActionsLive'

const TimerLive = ({ nextSet, restTime, startRestTimer }) => {
    // ✅ Keep `nextSet` as a prop
    const [timeLeft, setTimeLeft] = useState(restTime)
    const [activeRest, setActiveRest] = useState(false)

    // ✅ Reset timer when restTime changes
    useEffect(() => {
        if (restTime > 0) {
            console.log(`🔔 New rest timer started: ${restTime}s`)
            setTimeLeft(restTime)
            setActiveRest(true)
        }
    }, [restTime])

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
                        {nextSet.loading}kg X {nextSet.reps} reps
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
                        isNextSet={true}
                        restTime={nextSet.rest}
                        startRestTimer={startRestTimer}
                    />
                </div>
            )}
        </div>
    )
}

export default TimerLive
