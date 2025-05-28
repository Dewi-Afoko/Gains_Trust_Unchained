import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Dumbbell, Target, Clock, Focus, Edit } from 'lucide-react'
import useWorkoutStore from '../../stores/workoutStore'
import SetEditForm from '../sets/SetEditForm'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'
import texture2 from '../../assets/texture2.png'

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

    const title = showNextOnly ? 'Next 3 Sets' : showCompletedOnly ? 'Last 3 Sets' : 'All Sets'

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
                <div 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-3 mb-4 cursor-pointer hover:text-yellow-300 transition group"
                >
                    <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-2 shadow-lg group-hover:shadow-xl transition-shadow">
                        <Dumbbell className="w-6 h-6 stroke-[2.5px] text-black" />
                    </div>
                    <h3 className="text-brand-gold text-xl font-bold uppercase tracking-wider flex-1">
                        {title}
                    </h3>
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-brand-gold" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-brand-gold" />
                    )}
                </div>

                <div
                    className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
                >
                    {filteredSets.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredSets.map((set, index) => (
                                <li
                                    key={`${set.id}-${set.set_order}-${index}`}
                                    className="p-4 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-sm rounded-lg border border-brand-gold/30 shadow-inner hover:border-brand-gold/50 transition-all duration-200 hover:transform hover:scale-[1.02]"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1.5 shadow-lg">
                                            <Dumbbell className="w-4 h-4 stroke-[2.5px] text-black" />
                                        </div>
                                        <p className="text-lg text-brand-gold font-bold flex-1">
                                            {set.exercise_name}
                                            {set.set_type && <span className="text-gray-300 font-medium"> - {set.set_type}</span>}
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                        {set.focus && (
                                            <div className="flex items-center gap-2">
                                                <Focus className="w-3 h-3 text-gray-400" />
                                                <p className="text-sm text-gray-300 font-medium">
                                                    Focus: {set.focus}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Target className="w-3 h-3 text-gray-400" />
                                            <p className="text-sm text-gray-300 font-medium">
                                                Loading: {formatLoading(set.loading)}
                                            </p>
                                        </div>
                                        {set.reps && (
                                            <div className="flex items-center gap-2">
                                                <Dumbbell className="w-3 h-3 text-gray-400" />
                                                <p className="text-sm text-gray-300 font-medium">
                                                    Reps: {set.reps}
                                                </p>
                                            </div>
                                        )}
                                        {set.rest && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <p className="text-sm text-gray-300 font-medium">
                                                    Rest: {set.rest}s
                                                </p>
                                            </div>
                                        )}
                                        {set.set_duration !== null && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <p className="text-sm text-gray-300 font-medium">
                                                    Set Duration: {new Date(set.set_duration * 1000)
                                                        .toISOString()
                                                        .substr(14, 5)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <PanelButton
                                        onClick={() => setEditingSetId(set.id)}
                                        className="w-full flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Set
                                    </PanelButton>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <Dumbbell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-400 font-medium">
                                {showNextOnly
                                    ? 'No upcoming sets.'
                                    : 'No completed sets.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {editingSetId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4 shadow-lg">
                        <SetEditForm
                            setId={editingSetId}
                            onClose={() => setEditingSetId(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default SetTrackerLive
