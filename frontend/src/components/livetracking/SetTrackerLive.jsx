import { useState, useEffect } from 'react'
import useWorkoutStore from '../../stores/workoutStore'
import SetEditForm from '../sets/SetEditForm'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'

const SetTrackerLive = ({ showNextOnly, showCompletedOnly }) => {
    const { sets } = useWorkoutStore()
    const [editingSetId, setEditingSetId] = useState(null)
    const [isExpanded, setIsExpanded] = useState(true)
    const [filteredSets, setFilteredSets] = useState([])

    useEffect(() => {
        if (!sets || sets.length === 0) {
            setFilteredSets([])
            return
        }

        let newFilteredSets = [...sets]

        if (showNextOnly) {
            newFilteredSets = sets.filter((set) => !set.complete).slice(0, 3)
        } else if (showCompletedOnly) {
            newFilteredSets = sets
                .filter((set) => set.complete)
                .slice(-3)
                .reverse()
        }

        setFilteredSets([...newFilteredSets])
    }, [sets, showNextOnly, showCompletedOnly])

    return (
        <div className="bg-[#500000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg w-auto max-w-md">
            <h3
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-yellow-400 text-2xl font-extrabold text-stroke mb-3 cursor-pointer hover:text-yellow-300 transition"
            >
                {showNextOnly ? 'Next 3 Sets' : 'Last 3 Sets'}{' '}
                {isExpanded ? '🔽' : '▶️'}
            </h3>

            <div
                className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                {filteredSets.length > 0 ? (
                    <ul className="space-y-3 text-center">
                        {filteredSets.map((set, index) => (
                            <li
                                key={`${set.id}-${set.set_order}-${index}`}
                                className="p-3 bg-[#600000] border border-yellow-400 rounded-lg shadow-md min-w-[250px] max-w-full group hover:scale-105 transition-transform duration-200"
                            >
                                <p className="text-lg text-yellow-300 font-bold">
                                    {set.exercise_name}{' '}
                                    {set.set_type ? `- ${set.set_type}` : ''}
                                </p>
                                {set.focus && (
                                    <p className="text-sm text-gray-300">
                                        🧠 Focus: {set.focus}
                                    </p>
                                )}
                                <p className="text-sm text-gray-300">
                                    🔥 Loading: {formatLoading(set.loading)}
                                </p>
                                {set.reps && (
                                    <p className="text-sm text-gray-300">
                                        💪🏾 Reps: {set.reps}
                                    </p>
                                )}
                                {set.rest && (
                                    <p className="text-sm text-gray-300">
                                        ⏳ Rest: {set.rest}s
                                    </p>
                                )}
                                {set.set_duration !== null && (
                                    <p className="text-sm text-gray-300">
                                        ⏱️ Set Duration:{' '}
                                        {new Date(set.set_duration * 1000)
                                            .toISOString()
                                            .substr(14, 5)}
                                    </p>
                                )}

                                <PanelButton
                                    onClick={() => setEditingSetId(set.id)}
                                    className="mt-2 bg-yellow-600 hover:bg-yellow-700 border-yellow-800/80 text-black font-bold px-3 py-1"
                                >
                                    ✏️ Edit
                                </PanelButton>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center">
                        {showNextOnly
                            ? 'No upcoming sets.'
                            : 'No completed sets.'}
                    </p>
                )}
            </div>

            {editingSetId && (
                <SetEditForm
                    setId={editingSetId}
                    onClose={() => setEditingSetId(null)}
                />
            )}
        </div>
    )
}

export default SetTrackerLive
