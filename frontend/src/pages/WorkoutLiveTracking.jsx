import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { WorkoutProvider, useWorkoutContext } from '../context/WorkoutContext' // ✅ Use context
import WorkoutOverview from '../components/livetracking/WorkoutOverview'
import TimerLive from '../components/livetracking/TimerLive'
import SetTrackerLive from '../components/livetracking/SetTrackerLive'
import WorkoutControlsLive from '../components/livetracking/WorkoutControlsLive'

const WorkoutLiveTracking = () => {
    const { workoutId } = useParams()

    return (
        <WorkoutProvider workoutId={workoutId}>
            {' '}
            {/* ✅ Ensure Timer is inside provider */}
            <LiveTrackingContent />
        </WorkoutProvider>
    )
}

const LiveTrackingContent = () => {
    const { sets, timeElapsed } = useWorkoutContext(); // ✅ Get timeElapsed from context
    const nextSet = sets.find((set) => !set.complete) || null; // ✅ Calculate nextSet here
    const [restTime, setRestTime] = useState(0);
    const [timerKey, setTimerKey] = useState(0);

    const startRestTimer = (time) => {
        setRestTime(time);
        setTimerKey((prev) => prev + 1);
    };

    return (
        <div className="min-h-screen bg-[#600000] text-white pt-24 px-6">
            <WorkoutOverview /> {/* ✅ No longer tries to pass timeElapsed */}
            <div className="flex justify-between items-start gap-6 mt-8">
                <SetTrackerLive showNextOnly={true} />
                <TimerLive
                    key={timerKey}
                    nextSet={nextSet}
                    restTime={restTime}
                    startRestTimer={startRestTimer}
                />
                <SetTrackerLive showCompletedOnly={true} />
            </div>
            <WorkoutControlsLive />
        </div>
    );
};


export default WorkoutLiveTracking
