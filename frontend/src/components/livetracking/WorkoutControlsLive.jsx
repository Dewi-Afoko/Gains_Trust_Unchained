import { useState } from 'react'
import { BarChart3, Clock, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'
import useWorkoutStore from '../../stores/workoutStore'
import SetsTableFull from '../sets/SetsTableFull'
import PanelHeader from '../ui/PanelHeader'
import texture2 from '../../assets/texture2.png'

const WorkoutControlsLive = () => {
    const [showIncomplete, setShowIncomplete] = useState(false)
    const [showCompleted, setShowCompleted] = useState(false)
    const { completeSets, incompleteSets } = useWorkoutStore()

    // Get and sort completed sets
    const sortedCompleteSets = [...completeSets()].sort(
        (a, b) => b.set_order - a.set_order
    )

    const incompleteCount = incompleteSets().length
    const completedCount = sortedCompleteSets.length

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
                <PanelHeader 
                    title="Workout Overview"
                    icon={BarChart3}
                    size="large"
                />

                {/* Collapsible Buttons Side-by-Side */}
                <div className="flex justify-center space-x-6 mb-4">
                    <div
                        onClick={() => setShowIncomplete(!showIncomplete)}
                        className="flex items-center gap-2 text-xl font-semibold cursor-pointer hover:text-yellow-300 transition group bg-brand-dark border border-brand-gold/30 rounded-lg px-4 py-2 hover:border-brand-gold/50"
                    >
                        <Clock className="w-5 h-5 text-gray-400 group-hover:text-yellow-300 transition" />
                        <span className="text-gray-400 group-hover:text-yellow-300 transition font-semibold">
                            Incomplete Sets ({incompleteCount})
                        </span>
                        {showIncomplete ? (
                            <ChevronDown className="w-4 h-4 text-brand-gold group-hover:text-yellow-300 transition" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-brand-gold group-hover:text-yellow-300 transition" />
                        )}
                    </div>
                    <div
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="flex items-center gap-2 text-xl font-semibold cursor-pointer hover:text-yellow-300 transition group bg-brand-dark border border-brand-gold/30 rounded-lg px-4 py-2 hover:border-brand-gold/50"
                    >
                        <CheckCircle className="w-5 h-5 text-yellow-500 group-hover:text-yellow-300 transition" />
                        <span className="text-yellow-500 group-hover:text-yellow-300 transition font-semibold">
                            Completed Sets ({completedCount})
                        </span>
                        {showCompleted ? (
                            <ChevronDown className="w-4 h-4 text-brand-gold group-hover:text-yellow-300 transition" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-brand-gold group-hover:text-yellow-300 transition" />
                        )}
                    </div>
                </div>

                {/* Tables: Side by Side if Both Open, Full Width if One Open */}
                <div
                    className={`flex gap-6 transition-all ${showIncomplete && showCompleted ? 'flex-row' : 'flex-col'}`}
                >
                    {showIncomplete && (
                        <div
                            className={`overflow-hidden transition-all duration-500 flex-1 ${showIncomplete ? 'max-h-[400px]' : 'max-h-0'}`}
                        >
                            <div className="overflow-y-auto max-h-[400px] bg-brand-dark border border-brand-gold/30 rounded-lg p-4 relative">
                                {/* Table background texture */}
                                <div
                                    className="absolute inset-0 opacity-20 pointer-events-none z-0 rounded-lg"
                                    style={{ 
                                        backgroundImage: `url(${texture2})`,
                                        backgroundSize: '200px 200px',
                                        backgroundRepeat: 'repeat'
                                    }}
                                />
                                <div className="relative z-10">
                                    <SetsTableFull
                                        sets={incompleteSets()}
                                        hideCompleteColumn={true}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {showCompleted && (
                        <div
                            className={`overflow-hidden transition-all duration-500 flex-1 ${showCompleted ? 'max-h-[400px]' : 'max-h-0'}`}
                        >
                            <div className="overflow-y-auto max-h-[400px] bg-brand-dark border border-brand-gold/30 rounded-lg p-4 relative">
                                {/* Table background texture */}
                                <div
                                    className="absolute inset-0 opacity-20 pointer-events-none z-0 rounded-lg"
                                    style={{ 
                                        backgroundImage: `url(${texture2})`,
                                        backgroundSize: '200px 200px',
                                        backgroundRepeat: 'repeat'
                                    }}
                                />
                                <div className="relative z-10">
                                    <SetsTableFull
                                        sets={sortedCompleteSets}
                                        hideCompleteColumn={true}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default WorkoutControlsLive
