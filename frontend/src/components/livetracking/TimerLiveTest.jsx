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
    const [highlightNextSet, setHighlightNextSet] = useState(false)

    useEffect(() => {
        if (restTime > 0) {
            console.log(`🔔 New rest timer started: ${restTime}s`)
            setTimeLeft(restTime)
            setActiveRest(true)
        }
    }, [restTime])

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
            }, 1000)
            return () => clearInterval(timer)
        } else {
            setActiveRest(false)
            setHighlightNextSet(true)
            setTimeout(() => setHighlightNextSet(false), 1500)
        }
    }, [timeLeft])

    return (
        <div className="bg-gradient-to-b from-red-900 to-black text-white p-10 rounded-xl shadow-lg border border-yellow-500 w-full max-w-[900px] mx-auto text-center relative">
            <h2 className="text-6xl font-extrabold text-yellow-300 drop-shadow-md uppercase tracking-wider">
                {activeRest ? (
                    <>
                        <div className="flex justify-center items-center mb-2">
                            <img src="/icons/hourglass.svg" alt="Rest Timer" className="h-12 w-12" />
                        </div>
                        <span className="animate-pulse">Rebuild Your Strength!</span>
                        <br />
                        <span
                            className={
                                timeLeft <= 5
                                    ? 'text-red-600 text-7xl font-extrabold animate-shake'
                                    : 'text-yellow-400'
                            }
                        >
                            <br />
                            Next Set In: {timeLeft}s
                        </span>
                    </>
                ) : (
                    <>
                        <div className="flex justify-center items-center mb-2">
                            <img src="/icons/barbell.svg" alt="Workout Icon" className="h-14 w-14" />
                        </div>
                        <span className="text-yellow-400 text-7xl animate-bounce">Time to Smash!</span>
                        <br />
                        <br />
                        <span className="text-6xl font-extrabold text-yellow-500 drop-shadow-lg">
                            {nextSet?.exercise_name || 'Next Set'}
                        </span>
                    </>
                )}
            </h2>

            {activeRest && nextSet && (
                <div className="mt-6 p-6 bg-[#500000] rounded-lg border border-yellow-500 shadow-lg">
                    <h3 className="text-3xl font-extrabold text-yellow-300 uppercase">Next Up:</h3>
                    <p className="text-4xl font-extrabold text-stroke mt-2">
                        {nextSet.loading}kg X {nextSet.reps} reps
                    </p>
                    <p className="text-lg font-extrabold text-yellow-200">
                        ({nextSet.exercise_name} - Set {nextSet.set_number})
                    </p>
                    {nextSet.notes && (
                        <p className="text-md font-extrabold text-yellow-100 mt-2 italic">
                            "{nextSet.notes}"
                        </p>
                    )}
                </div>
            )}

            {!activeRest && nextSet && (
                <div className={`mt-6 text-xl text-yellow-300 transition-all ${highlightNextSet ? 'bg-yellow-600 p-4 rounded-lg scale-105' : ''}`}>
                    <p className="text-4xl font-extrabold text-yellow-500 drop-shadow-lg">
                        {nextSet.loading}kg X {nextSet.reps} reps
                    </p>
                    <p className="text-xl font-extrabold text-yellow-400">
                        ({nextSet.exercise_name} - Set {nextSet.set_number})
                    </p>
                    {nextSet.notes && (
                        <p className="text-md font-extrabold text-yellow-200 italic mt-2">
                            "{nextSet.notes}"
                        </p>
                    )}
                </div>
            )}

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
