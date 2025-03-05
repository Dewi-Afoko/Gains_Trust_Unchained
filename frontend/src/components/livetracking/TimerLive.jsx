import { useState, useEffect, useRef } from 'react';
import SetActionsLive from './SetActionsLive';
import { useWorkoutContext } from "../../context/WorkoutContext"; // ✅ Get context
import { formatLoading } from '../../lib/utils';

const TimerLive = ({ nextSet, restTime, startRestTimer, isRunning: isRunningProp, startTimer, stopTimer }) => {
    const [timeLeft, setTimeLeft] = useState(restTime);
    const [activeRest, setActiveRest] = useState(false);
    const [isRunning, setIsRunning] = useState(isRunningProp); // ✅ Store isRunning in state
    const { timeElapsed, workoutId } = useWorkoutContext(); // ✅ Get timeElapsed from context
    const startTimeRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        console.log("🔄 TimerLive: isRunningProp updated to:", isRunningProp);
        setIsRunning(isRunningProp);
    }, [isRunningProp]);
    
    useEffect(() => {
        console.log("🔄 TimerLive: isRunning state is now:", isRunning);
    }, [isRunning]);
    
    useEffect(() => {
        setActiveRest(false); // ✅ Ensure UI resets rest state
        setTimeLeft(0); // ✅ Reset timer only when switching workouts
    }, [workoutId]); // ✅ Runs only when the workout ID changes

    useEffect(() => {
        const savedStartTime = localStorage.getItem("restStartTime");
        const savedDuration = localStorage.getItem("restDuration");
    
        if (savedStartTime && savedDuration) {
            const startTimestamp = parseInt(savedStartTime, 10);
            const duration = parseInt(savedDuration, 10);
            const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
            const remaining = Math.max(duration - elapsed, 0);
    
            if (remaining > 0) {
                setTimeLeft(remaining);  // ✅ Set state from localStorage, not internal tracking
                setActiveRest(true);
                startTimeRef.current = startTimestamp;
    
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = setInterval(() => {
                    const nowElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    const updatedRemaining = Math.max(duration - nowElapsed, 0);
    
                    setTimeLeft(updatedRemaining);
    
                    if (updatedRemaining === 0) {
                        clearInterval(intervalRef.current);
                        setActiveRest(false);
                        localStorage.removeItem("restStartTime");
                        localStorage.removeItem("restDuration");
                    }
                }, 1000);
            } else {
                localStorage.removeItem("restStartTime");
                localStorage.removeItem("restDuration");
            }
        }
    }, []); // ✅ Runs once on mount
    
    
    
    
    

    const handleStartRest = (newRestTime) => {
        console.log(`🔔 New rest timer started: ${newRestTime}s`);
        const now = Date.now();
    
        localStorage.setItem("restStartTime", now); // ✅ Store exact start time once
        localStorage.setItem("restDuration", newRestTime); // ✅ Store original duration
    
        setTimeLeft(newRestTime);
        startTimeRef.current = now;
        setActiveRest(true);
    
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const remaining = Math.max(newRestTime - elapsed, 0);
    
            setTimeLeft(remaining); // ✅ UI updates, but no `localStorage` changes
    
            if (remaining === 0) {
                clearInterval(intervalRef.current);
                setActiveRest(false);
                localStorage.removeItem("restStartTime");
                localStorage.removeItem("restDuration");
            }
        }, 1000);
    };
    
    

    return (
        <div className={`bg-[#400000] text-white p-6 rounded-2xl shadow-lg border border-yellow-400 w-full max-w-[900px] mx-auto text-center relative ${timeLeft <= 5 && activeRest ? 'animate-glow' : ''}`}>
            <div className={`absolute inset-0 z-[-1] ${timeLeft <= 5 && activeRest ? 'animate-pulse-glow' : ''}`}></div>
            <h2 className="text-5xl font-extrabold text-yellow-400 drop-shadow-lg">
                {activeRest ? (
                    <>
                        ⏳ <span className="animate-pulse">Rest Up, Comrade!</span> ⌛️
                        <br />
                        <span className={`block mt-2 text-6xl font-extrabold ${timeLeft <= 5 ? 'text-red-600 animate-bounce' : 'text-yellow-300'}`}>
                            Next Set In: {timeLeft}s
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-yellow-300 text-6xl animate-pulse">
                            ⛓️‍💥 Time to Smash: ⛓️‍💥
                        </span>
                        <br />
                        <span className="text-5xl font-bold block mt-4 text-yellow-300">
                            🔥 {nextSet?.exercise_name || 'Next Set'} 🔥
                        </span>
                    </>
                )}
            </h2>

            {activeRest && nextSet && (
                <div className="mt-5 p-4 bg-[#500000] rounded-lg border border-yellow-400 shadow-md">
                    <h3 className="text-3xl font-bold text-yellow-300">Up Next: {nextSet.exercise_name}</h3>
                    <p className="text-2xl font-extrabold mt-2 text-yellow-200">
                        {formatLoading(nextSet.loading)} X {nextSet.reps} reps
                    </p>
                    <p className="text-lg font-bold text-yellow-200 opacity-80">
                        ({nextSet.exercise_name} - Set {nextSet.set_number})
                    </p>
                    {nextSet.notes && (
                        <p className="text-md font-semibold mt-2 text-yellow-400">
                            Notes: {nextSet.notes}
                        </p>
                    )}
                </div>
            )}

            {!activeRest && nextSet && (
                <div className="mt-6 text-xl text-yellow-300">
                    <p className="text-4xl font-extrabold">{formatLoading(nextSet.loading)} X {nextSet.reps} reps</p>
                    <p className="text-lg font-bold opacity-80">
                        ({nextSet.exercise_name} - Set {nextSet.set_number})
                    </p>
                    {nextSet.notes && (
                        <p className="text-md font-semibold mt-2 text-yellow-400">
                            Performance Notes: <br /> {nextSet.notes}
                        </p>
                    )}
                </div>
            )}

            {!activeRest && nextSet && (
                <div className="mt-6 flex justify-center">
                    <SetActionsLive
                        key={isRunning}
                        setId={nextSet.id}
                        isNextSet={true}
                        restTime={nextSet.rest}
                        startRestTimer={handleStartRest}
                        isRunning={timeElapsed > 0}
                    />
                </div>
            )}
        </div>
    );
};

export default TimerLive;