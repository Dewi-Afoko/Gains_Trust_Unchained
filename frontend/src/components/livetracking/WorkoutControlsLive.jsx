import { useState } from 'react'
import { BarChart3, Clock, CheckCircle } from 'lucide-react'
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

                {/* Incomplete Sets Section */}
                <div className="mb-4">
                    <PanelHeader 
                        title={`Incomplete Sets (${incompleteCount})`}
                        icon={Clock}
                        size="normal"
                        collapsible={true}
                        isExpanded={showIncomplete}
                        onToggle={() => setShowIncomplete(!showIncomplete)}
                    />

                    <div
                        className={`transition-all duration-500 ease-in-out ${
                            showIncomplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        style={{
                            height: showIncomplete ? 'auto' : '0px',
                            overflow: showIncomplete ? 'visible' : 'hidden'
                        }}
                    >
                        <div className="bg-brand-dark border border-brand-gold/30 rounded-lg p-4 relative">
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
                </div>

                {/* Completed Sets Section */}
                <div className="mb-4">
                    <PanelHeader 
                        title={`Completed Sets (${completedCount})`}
                        icon={CheckCircle}
                        size="normal"
                        collapsible={true}
                        isExpanded={showCompleted}
                        onToggle={() => setShowCompleted(!showCompleted)}
                    />

                    <div
                        className={`transition-all duration-500 ease-in-out ${
                            showCompleted ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        style={{
                            height: showCompleted ? 'auto' : '0px',
                            overflow: showCompleted ? 'visible' : 'hidden'
                        }}
                    >
                        <div className="bg-brand-dark border border-brand-gold/30 rounded-lg p-4 relative">
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
                </div>
            </div>
        </div>
    )
}

export default WorkoutControlsLive
