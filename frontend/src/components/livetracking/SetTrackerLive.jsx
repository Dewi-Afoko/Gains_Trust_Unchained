import { useState, useEffect } from 'react'
import { Dumbbell, Target, Clock, Focus, Edit } from 'lucide-react'
import useWorkoutStore from '../../stores/workoutStore'
import SetEditForm from '../sets/SetEditForm'
import { formatLoading } from '../../utils/formatters'
import PanelButton from '../ui/PanelButton'
import PanelHeader from '../ui/PanelHeader'
import texture2 from '../../assets/texture2.png'

const SetTrackerLive = ({ showNextOnly, showCompletedOnly, onExpandChange }) => {
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

    // Notify parent when expansion state changes
    useEffect(() => {
        if (onExpandChange) {
            onExpandChange(isExpanded)
        }
    }, [isExpanded, onExpandChange])

    const title = showNextOnly ? 'Next 3 Sets' : showCompletedOnly ? 'Last 3 Sets' : 'All Sets'

    const handleToggleExpanded = () => {
        setIsExpanded(!isExpanded)
    }

    return (
        <div className="bg-brand-dark-2 border border-brand-gold shadow-lg rounded-2xl flex flex-col overflow-hidden p-6 text-white relative">
            {/* Background Texture */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none z-0 rounded-2xl"
                style={{ 
                    backgroundImage: `linear-gradient(to bottom, rgba(234,179,8,0.18) 0%, #1a1a1a 40%, #0e0e0e 100%), url(${texture2})`,
                    backgroundBlendMode: 'overlay, multiply',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />
            
            {/* Content */}
            <div className="relative z-20">
                {/* Collapsible Header */}
                <PanelHeader 
                    title={title}
                    icon={Dumbbell}
                    size="large"
                    collapsible={true}
                    isExpanded={isExpanded}
                    onToggle={handleToggleExpanded}
                />

                {/* Collapsible Content with Dynamic Height */}
                <div
                    className={`transition-all duration-500 ease-in-out ${
                        isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    style={{
                        height: isExpanded ? 'auto' : '0px',
                        overflow: isExpanded ? 'visible' : 'hidden'
                    }}
                >
                    {filteredSets.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredSets.map((set, index) => (
                                <li
                                    key={`${set.id}-${set.set_order}-${index}`}
                                    className={`p-4 bg-brand-dark border-2 border-brand-gold/30 rounded-lg shadow-inner hover:border-brand-gold hover:shadow-lg transition-all duration-200 hover:transform hover:scale-[1.02] relative overflow-hidden`}
                                >
                                    {/* Individual set background texture */}
                                    <div
                                        className="absolute inset-0 opacity-20 pointer-events-none z-0 rounded-lg"
                                        style={{ 
                                            backgroundImage: `url(${texture2})`,
                                            backgroundSize: '200px 200px',
                                            backgroundRepeat: 'repeat'
                                        }}
                                    />
                                    <div className="relative z-10">
                                        {/* Exercise Name as Panel Header */}
                                        <div className="bg-gradient-to-b from-yellow-700/60 via-[#1a1a1a] to-[#0e0e0e] border border-brand-gold/80 rounded-t-lg p-3 mb-0 -mx-4 -mt-4"
                                            style={{
                                                backgroundImage: `linear-gradient(to bottom, rgba(234,179,8,0.18) 0%, #1a1a1a 40%, #0e0e0e 100%), url(${texture2})`,
                                                backgroundBlendMode: 'overlay, multiply',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                                                <p className="text-base font-extrabold uppercase tracking-wider bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] text-center">
                                                    {set.exercise_name}
                                                </p>
                                                <span className="w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                                            </div>
                                        </div>
                                        
                                        {/* Set Info Section */}
                                        <div className="pt-4 space-y-2 mb-3">
                                            {set.set_type && (
                                                <div className="flex items-center gap-2">
                                                    <Dumbbell className="w-3 h-3 text-gray-400" />
                                                    <p className="text-sm text-gray-300 font-medium">
                                                        Type: {set.set_type}
                                                    </p>
                                                </div>
                                            )}
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
                                            {(set.set_duration !== null || set.complete) && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <p className="text-sm text-gray-300 font-medium">
                                                        Duration: {(() => {
                                                            // Try optimistic update first (from localStorage)
                                                            const optimisticDuration = localStorage.getItem(`completedSetDuration_${set.id}`)
                                                            if (optimisticDuration && set.complete) {
                                                                const seconds = parseInt(optimisticDuration)
                                                                const minutes = Math.floor(seconds / 60)
                                                                const secs = seconds % 60
                                                                return `${minutes}:${secs.toString().padStart(2, '0')}`
                                                            }
                                                            // Fall back to server data
                                                            if (set.set_duration !== null) {
                                                                return new Date(set.set_duration * 1000)
                                                                    .toISOString()
                                                                    .substr(14, 5)
                                                            }
                                                            return 'Calculating...'
                                                        })()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <PanelButton
                                            onClick={() => setEditingSetId(set.id)}
                                            variant="gold"
                                            className="text-sm"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Set
                                        </PanelButton>
                                    </div>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 p-4">
                    <div className="bg-brand-dark-2 border border-brand-gold/30 backdrop-blur-sm p-6 rounded-xl w-full max-w-lg mx-4 shadow-2xl relative overflow-hidden">
                        {/* Modal background texture */}
                        <div
                            className="absolute inset-0 opacity-40 pointer-events-none z-0 rounded-xl"
                            style={{ 
                                backgroundImage: `linear-gradient(to bottom, rgba(234,179,8,0.18) 0%, #1a1a1a 40%, #0e0e0e 100%), url(${texture2})`,
                                backgroundBlendMode: 'overlay, multiply',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                        <div className="relative z-10">
                            <SetEditForm
                                setId={editingSetId}
                                onClose={() => setEditingSetId(null)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SetTrackerLive
