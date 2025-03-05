import { useNavigate } from "react-router-dom";
import { useWorkoutContext } from "../../context/WorkoutContext";
import WorkoutTimerDisplay from "./WorkoutTimerDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const WorkoutOverview = () => {
    const { workout, completeSets, workoutSets, timeElapsed } = useWorkoutContext();
    const navigate = useNavigate();

    const totalSets = workoutSets?.[workout?.id]?.length || 0;
    const completedCount = completeSets?.length || 0;
    const progress = totalSets > 0 ? (completedCount / totalSets) * 100 : 0;
    const isWorkoutComplete = Boolean(workout?.duration);

    // Compute raw count of exercises
    const exerciseCount = completeSets.reduce((acc, set) => {
        acc[set.exercise_name] = (acc[set.exercise_name] || 0) + 1;
        return acc;
    }, {});

    const summaryData = Object.keys(exerciseCount).map((exercise) => ({
        name: exercise,
        value: exerciseCount[exercise]
    }));

    return (
        <div className="relative flex flex-col bg-[#400000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg">
            <button
                onClick={() => navigate("/workouts")}
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
                            🏋🏾‍♂️ {workout?.workout_name || "Live Workout"}
                        </h2>
                        <WorkoutTimerDisplay timeElapsed={timeElapsed} workout={workout} />
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
                            className="text-yellow-300 text-xl font-bold mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Total Time: {new Date(workout.duration * 1000).toISOString().substr(11, 8)}
                        </motion.div>

                        <ResponsiveContainer width="100%" height={200} className="mt-4">
                            <BarChart data={summaryData}>
                                <XAxis dataKey="name" stroke="#FFD700" />
                                <YAxis stroke="#FFD700" />
                                <Tooltip formatter={(value, name) => [`${value} set(s)`]} wrapperStyle={{ color: "black" }} />
                                <Bar dataKey="value" fill="#FFD700" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkoutOverview;