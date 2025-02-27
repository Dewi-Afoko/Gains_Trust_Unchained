import { useState } from 'react';
import { useWorkoutContext } from '../../context/WorkoutContext'; // ✅ Import context
import SetsTableFull from '../sets/SetsTableFull';

const WorkoutControlsLive = () => {
    const [showIncomplete, setShowIncomplete] = useState(false); // ✅ Default to collapsed
    const [showCompleted, setShowCompleted] = useState(false); // ✅ Default to collapsed
    const { completeSets, incompleteSets } = useWorkoutContext(); // ✅ Get complete/incomplete sets

    console.log('✅ Incomplete Sets:', incompleteSets.length);
    console.log('✅ Complete Sets:', completeSets.length);


    return (
        <div className="bg-[#500000] text-white p-6 rounded-xl border border-yellow-400 shadow-lg mt-6 text-center">
            <h3 className="text-yellow-400 text-2xl font-extrabold text-stroke mb-4">
                📊 Workout Overview
            </h3>

            {/* ⏳ Incomplete Sets Section */}
            <div className="mb-4">
                <h4
                    onClick={() => setShowIncomplete(!showIncomplete)}
                    className="text-gray-400 text-xl font-bold cursor-pointer hover:text-gray-300 transition text-center"
                >
                    ⚠️ Incomplete Sets {showIncomplete ? '🔽' : '▶️'}
                </h4>
                <div
                    className={`overflow-hidden transition-all duration-500 ${showIncomplete ? 'max-h-[400px]' : 'max-h-0'}`}
                >
                    <div className="overflow-y-auto max-h-[400px]">
                        <SetsTableFull sets={incompleteSets} hideCompleteColumn={true} /> {/* ✅ Use incompleteSets */}
                    </div>
                </div>
            </div>

            {/* ✅ Completed Sets Section */}
            <div>
                <h4
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="text-yellow-500 text-xl font-bold cursor-pointer hover:text-yellow-400 transition text-center"
                >
                    ⭐ Completed Sets {showCompleted ? '🔽' : '▶️'}
                </h4>
                <div
                    className={`overflow-hidden transition-all duration-500 ${showCompleted ? 'max-h-[400px]' : 'max-h-0'}`}
                >
                    <div className="overflow-y-auto max-h-[400px]">
                        <SetsTableFull sets={completeSets} hideCompleteColumn={true} /> {/* ✅ Use completeSets */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutControlsLive;
