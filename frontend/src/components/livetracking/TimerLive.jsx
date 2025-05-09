import { useEffect, useRef, useState } from 'react'
import useWorkoutStore from '../../stores/workoutStore'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'

const TimerLive = ({ nextSet }) => {
    const { timeElapsed, startTimer, stopTimer } = useWorkoutStore()
    const [setTimer, setSetTimer] = useState(0)
    const intervalRefSet = useRef(null)

    const resetSetTimer = (restart = false) => {
        if (intervalRefSet.current) {
            clearInterval(intervalRefSet.current)
            intervalRefSet.current = null
        }
        setSetTimer(0)

        if (restart) {
            intervalRefSet.current = setInterval(() => {
                setSetTimer((prev) => prev + 1)
            }, 1000)
        }
    }

    useEffect(() => {
        startTimer()
        return () => stopTimer()
    }, [])

    useEffect(() => {
        if (nextSet?.complete) {
            resetSetTimer()
        } else {
            resetSetTimer(true)
        }

        return () => {
            if (intervalRefSet.current) {
                clearInterval(intervalRefSet.current)
            }
        }
    }, [nextSet?.complete])

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60

        const pad = (num) => String(num).padStart(2, '0')
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`
    }

    return (
        <div className="bg-[#500000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg w-auto max-w-md">
            <h3 className="text-yellow-400 text-2xl font-extrabold text-stroke mb-3">
                ⏱️ Workout Timer
            </h3>
            <div className="text-center">
                <p className="text-4xl font-mono text-white">
                    {formatTime(timeElapsed)}
                </p>
                {nextSet && (
                    <div className="mt-4">
                        <h4 className="text-yellow-300 text-lg font-bold mb-2">
                            Current Set
                        </h4>
                        <p className="text-gray-300">
                            {nextSet.exercise_name} - Set {nextSet.set_number}
                        </p>
                        {nextSet.loading && (
                            <p className="text-gray-300">
                                Loading: {formatLoading(nextSet.loading)}
                            </p>
                        )}
                        {nextSet.reps && (
                            <p className="text-gray-300">
                                Target Reps: {nextSet.reps}
                            </p>
                        )}
                        <p className="text-2xl font-mono mt-2">
                            {formatTime(setTimer)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TimerLive
