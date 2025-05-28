import { useEffect, useRef, useState } from 'react'
import { Clock, Play, Dumbbell } from 'lucide-react'
import useWorkoutStore from '../../stores/workoutStore'
import useTimerStore from '../../stores/timerStore'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'
import texture2 from '../../assets/texture2.png'

const TimerLive = ({ nextSet }) => {
    const { timeElapsed } = useTimerStore()
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
        if (!seconds || seconds < 0 || isNaN(seconds)) {
            return '00:00:00'
        }
        
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60

        const pad = (num) => String(num).padStart(2, '0')
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`
    }

    return (
        <div className="relative overflow-hidden bg-gradient-to-b from-brand-dark-2/90 via-brand-dark/80 to-brand-dark-2/90 backdrop-blur-sm rounded-xl border border-brand-gold/40 p-6 shadow-2xl">
            {/* Background Texture */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none z-0 rounded-xl"
                style={{ 
                    backgroundImage: `url(${texture2})`,
                    backgroundSize: '300px 300px',
                    backgroundRepeat: 'repeat',
                    backgroundAttachment: 'scroll',
                    backgroundPosition: 'center center'
                }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 via-black/60 to-black/80 rounded-xl z-10"></div>
            
            {/* Content */}
            <div className="relative z-20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-2 shadow-lg">
                        <Clock className="w-6 h-6 stroke-[2.5px] text-black" />
                    </div>
                    <h3 className="text-brand-gold text-xl font-bold uppercase tracking-wider">
                        Workout Timer
                    </h3>
                </div>
                
                <div className="text-center">
                    <p className="text-4xl font-mono text-white font-bold">
                        {formatTime(timeElapsed || 0)}
                    </p>
                    {nextSet && (
                        <div className="mt-6 p-4 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-sm rounded-lg border border-brand-gold/30 shadow-inner">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1.5 shadow-lg">
                                    <Dumbbell className="w-4 h-4 stroke-[2.5px] text-black" />
                                </div>
                                <h4 className="text-brand-gold text-lg font-bold uppercase tracking-wider">
                                    Current Set
                                </h4>
                            </div>
                            <p className="text-gray-300 font-medium mb-2">
                                {nextSet.exercise_name} - Set {nextSet.set_number}
                            </p>
                            {nextSet.loading && (
                                <p className="text-gray-300 font-medium mb-2">
                                    Loading: {formatLoading(nextSet.loading)}
                                </p>
                            )}
                            {nextSet.reps && (
                                <p className="text-gray-300 font-medium mb-2">
                                    Target Reps: {nextSet.reps}
                                </p>
                            )}
                            <p className="text-2xl font-mono font-bold text-yellow-400 mt-3">
                                {formatTime(setTimer)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TimerLive
