import { useNavigate } from 'react-router-dom'
import { useWorkoutContext } from '../../context/WorkoutContext'
import WorkoutTimerDisplay from './WorkoutTimerDisplay'
import { motion, AnimatePresence } from 'framer-motion'

const WorkoutOverview = () => {
    const { workout, completeSets, workoutSets, timeElapsed } =
        useWorkoutContext()
    const navigate = useNavigate()

    const totalSets = workoutSets?.[workout?.id]?.length || 0
    const completedCount = completeSets?.length || 0
    const progress = totalSets > 0 ? (completedCount / totalSets) * 100 : 0
    const isWorkoutComplete = Boolean(workout?.duration)
    const lastCompletedSet =
        [...completeSets].sort((a, b) => b.set_order - a.set_order)[0] || null

    const exerciseStats = completeSets.reduce((acc, set) => {
        if (!acc[set.exercise_name]) {
            acc[set.exercise_name] = {
                count: 0,
                totalDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
            }
        }
        acc[set.exercise_name].count += 1
        acc[set.exercise_name].totalDuration += set.set_duration || 0
        acc[set.exercise_name].minDuration = Math.min(
            acc[set.exercise_name].minDuration,
            set.set_duration || 0
        )
        acc[set.exercise_name].maxDuration = Math.max(
            acc[set.exercise_name].maxDuration,
            set.set_duration || 0
        )
        return acc
    }, {})

    const summaryData = Object.keys(exerciseStats).map((exercise) => ({
        name: exercise,
        value: exerciseStats[exercise],
    }))

    const totalSetDuration = Object.values(exerciseStats).reduce(
        (sum, stats) => sum + stats.totalDuration,
        0
    )
    const activeWorkoutPercentage = workout?.duration
        ? ((totalSetDuration / workout.duration) * 100).toFixed(1)
        : 0
    const efficiencyColor =
        activeWorkoutPercentage >= 80
            ? 'text-green-400'
            : activeWorkoutPercentage >= 50
              ? 'text-yellow-400'
              : 'text-red-400'

    return (
        <div className="relative flex flex-col bg-[#400000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg">
            <button
                onClick={() => navigate('/workouts')}
                className="absolute top-4 right-4 bg-[#8B0000] hover:bg-[#600000] text-white font-bold px-4 py-2 rounded-xl transition text-stroke"
            >
                ❌ Exit Workout
            </button>

            <AnimatePresence>
                {!isWorkoutComplete ? (
                    <motion.div
                        key="tracking-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center mb-2"
                    >
                        <h2 className="text-yellow-400 text-3xl font-extrabold text-stroke text-center">
                            🏋🏾‍♂️ {workout?.workout_name || 'Live Workout'}
                        </h2>

                        {lastCompletedSet &&
                            lastCompletedSet.set_duration !== null && (
                                <motion.div
                                    className="text-2xl text-center text-green-400 font-bold mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Last Set Took{' '}
                                    {new Date(
                                        lastCompletedSet.set_duration * 1000
                                    )
                                        .toISOString()
                                        .substr(14, 5)}
                                    - {lastCompletedSet.exercise_name} | Set{' '}
                                    {lastCompletedSet.set_number}
                                    {lastCompletedSet.loading
                                        ? ` | ${lastCompletedSet.loading}kg`
                                        : ''}
                                    {lastCompletedSet.reps
                                        ? ` | ${lastCompletedSet.reps} reps`
                                        : ''}
                                </motion.div>
                            )}

                        <WorkoutTimerDisplay
                            timeElapsed={timeElapsed}
                            workout={workout}
                        />
                        <div className="relative w-full bg-gray-700 rounded-full h-6 mt-4">
                            <div
                                className="bg-green-700 h-full rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            ></div>
                            <span className="absolute inset-0 flex justify-center items-center text-sm font-bold text-black-400">
                                {Math.round(progress)}% Complete
                            </span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="summary-view"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center mt-4"
                    >
                        <h2 className="text-yellow-400 text-3xl font-extrabold text-center animate-pulse">
                            🎉 Workout Complete!
                        </h2>
                        <motion.div
                            className={`text-xl font-bold mt-2 ${efficiencyColor}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="block text-center">
                                💪🏾 Workout Duration:{' '}
                                {new Date(workout.duration * 1000)
                                    .toISOString()
                                    .substr(11, 8)}
                            </span>
                            ⛓️‍💥 Time Active:{' '}
                            {new Date(totalSetDuration * 1000)
                                .toISOString()
                                .substr(11, 8)}
                            <br />
                            <span className="block text-center">
                                📈 Set Duration: {activeWorkoutPercentage}%
                            </span>
                        </motion.div>

                        <motion.div
                            className="mt-4 overflow-hidden whitespace-nowrap w-full flex"
                            initial={{ x: '100%' }}
                            animate={{ x: '-100%' }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            {Object.entries(exerciseStats).map(
                                ([exercise, stats]) => (
                                    <span
                                        key={exercise}
                                        className="text-yellow-300 text-xl font-bold mx-6"
                                    >
                                        🔄 Set Times For - {exercise}: Avg{' '}
                                        {Math.round(
                                            stats.totalDuration / stats.count
                                        )}
                                        s | ⏩ Fastest: {stats.minDuration}s |
                                        🛑 Slowest: {stats.maxDuration}s
                                    </span>
                                )
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default WorkoutOverview
