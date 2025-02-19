import { useState, useEffect } from 'react'

const TimerLive = ({ nextSet, restTime }) => {
    const [timeLeft, setTimeLeft] = useState(restTime)
    const [activeRest, setActiveRest] = useState(false)

    useEffect(() => {
        if (restTime > 0) {
            console.log(`🔔 Timer started: ${restTime}s`)
            setTimeLeft(restTime)
            setActiveRest(true)
        }
    }, [restTime])

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => Math.max(prev - 1, 0))
            }, 1000)
            return () => clearInterval(timer)
        } else {
            setActiveRest(false)
        }
    }, [timeLeft])

    const setDetails = nextSet
        ? `${nextSet.exercise_name} - ${nextSet.loading}kg X ${nextSet.reps} reps`
        : 'Next Set'

    // ✅ Dynamic styling for MAXIMUM drama
    let bgClass = 'bg-[#500000] text-yellow-400' // Default state
    let textClass = 'text-4xl md:text-5xl font-extrabold tracking-wide' // Default text size
    let extraEffects = '' // Additional effects at <= 5s

    if (activeRest) {
        if (timeLeft > 15) {
            bgClass = 'bg-[#400000] text-yellow-400'
        } else if (timeLeft > 10) {
            bgClass = 'bg-red-600 text-yellow-300 animate-pulse'
        } else if (timeLeft > 0) {
            bgClass = 'bg-red-700 text-yellow-200 animate-pulse'
        }
    }

    return (
        <div
            className={`text-center p-6 rounded shadow-lg mb-6 transition-all duration-500 ${bgClass} ${extraEffects}`}
        >
            <h2 className={textClass}>
                {activeRest ? (
                    <>
                        Rest Up, Comrade. <br /> Next Set In: {timeLeft}s
                    </>
                ) : (
                    <>
                        <span className="text-yellow-400">Time to Smash:</span>{' '}
                        <br />
                        <span className="text-yellow-300">{setDetails}</span>
                    </>
                )}
            </h2>
        </div>
    )
}

export default TimerLive
