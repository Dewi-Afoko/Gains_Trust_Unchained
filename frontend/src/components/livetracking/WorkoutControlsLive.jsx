import { useState } from 'react'
import { useWorkoutContext } from '../../context/WorkoutContext' // ✅ Import context
import SetsTableFull from '../sets/SetsTableFull'

const WorkoutControlsLive = () => {
    const [showIncomplete, setShowIncomplete] = useState(false) // ✅ Default to collapsed
    const [showCompleted, setShowCompleted] = useState(false) // ✅ Default to collapsed
    const { completeSets, incompleteSets } = useWorkoutContext() // ✅ Get complete/incomplete sets



    // ✅ Reverse completed sets so most recent appear first
    const sortedCompleteSets = [...completeSets].sort(
        (a, b) => b.set_order - a.set_order
    )

    return (
        <div className="bg-[#500000] text-white p-6 rounded-xl border border-yellow-400 shadow-lg mt-6 text-center">
            <h3 className="text-yellow-400 text-2xl font-extrabold text-stroke mb-4">
                📊 Workout Overview
            </h3>

            {/* ✅ Collapsible Buttons Side-by-Side */}
            <div className="flex justify-center space-x-6 mb-4">
                <h4
                    onClick={() => setShowIncomplete(!showIncomplete)}
                    className="text-gray-400 text-xl font-bold cursor-pointer hover:text-gray-300 transition"
                >
                    ⚠️ Incomplete Sets {showIncomplete ? '🔽' : '▶️'}
                </h4>
                <h4
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="text-yellow-500 text-xl font-bold cursor-pointer hover:text-yellow-400 transition"
                >
                    ⭐ Completed Sets {showCompleted ? '🔽' : '▶️'}
                </h4>
            </div>

            {/* ✅ Tables: Side by Side if Both Open, Full Width if One Open */}
            <div
                className={`flex gap-6 transition-all ${showIncomplete && showCompleted ? 'flex-row' : 'flex-col'}`}
            >
                {showIncomplete && (
                    <div
                        className={`overflow-hidden transition-all duration-500 flex-1 ${showIncomplete ? 'max-h-[400px]' : 'max-h-0'}`}
                    >
                        <div className="overflow-y-auto max-h-[400px]">
                            <SetsTableFull
                                sets={incompleteSets}
                                hideCompleteColumn={true}
                            />{' '}
                            {/* ✅ Use incompleteSets */}
                        </div>
                    </div>
                )}

                {showCompleted && (
                    <div
                        className={`overflow-hidden transition-all duration-500 flex-1 ${showCompleted ? 'max-h-[400px]' : 'max-h-0'}`}
                    >
                        <div className="overflow-y-auto max-h-[400px]">
                            <SetsTableFull
                                sets={sortedCompleteSets}
                                hideCompleteColumn={true}
                            />{' '}
                            {/* ✅ Sorted completed sets */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default WorkoutControlsLive
