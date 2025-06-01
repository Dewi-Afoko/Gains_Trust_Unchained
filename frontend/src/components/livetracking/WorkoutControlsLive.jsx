import { useState } from 'react'
import { BarChart3, Clock, CheckCircle, Settings } from 'lucide-react'
import useWorkoutStore from '../../stores/workoutStore'
import useUserPreferencesStore from '../../stores/userPreferencesStore'
import SetsTableFull from '../sets/SetsTableFull'
import PanelHeader from '../ui/PanelHeader'
import texture2 from '../../assets/texture2.png'

const WorkoutControlsLive = () => {
    const { sets } = useWorkoutStore()
    const { autoStartNextSet, toggleAutoStartNextSet } = useUserPreferencesStore()
    const [showIncomplete, setShowIncomplete] = useState(false)
    const [showCompleted, setShowCompleted] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    // Sort sets by set_order for proper display
    const sortedSets = sets ? [...sets].sort((a, b) => a.set_order - b.set_order) : []
    const incompleteSets = sortedSets.filter(set => !set.complete)
    const completedSets = sortedSets.filter(set => set.complete)
    
    // Sort completed sets in reverse order (most recent first)
    const sortedCompleteSets = [...completedSets].reverse()
    
    const incompleteCount = incompleteSets.length
    const completedCount = completedSets.length

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
            
            <div className="relative z-20">
                <PanelHeader 
                    title="Workout Overview"
                    icon={BarChart3}
                    size="large"
                />

                {/* Settings Section */}
                <div className="mb-4">
                    <PanelHeader 
                        title="Settings"
                        icon={Settings}
                        size="normal"
                        collapsible={true}
                        isExpanded={showSettings}
                        onToggle={() => setShowSettings(!showSettings)}
                    />

                    <div
                        className={`transition-all duration-500 ease-in-out ${
                            showSettings ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        style={{
                            height: showSettings ? 'auto' : '0px',
                            overflow: showSettings ? 'visible' : 'hidden'
                        }}
                    >
                        <div className="bg-brand-dark border border-brand-gold/30 rounded-lg p-4 relative mb-4">
                            {/* Settings background texture */}
                            <div
                                className="absolute inset-0 opacity-20 pointer-events-none z-0 rounded-lg"
                                style={{ 
                                    backgroundImage: `url(${texture2})`,
                                    backgroundSize: '200px 200px',
                                    backgroundRepeat: 'repeat'
                                }}
                            />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <label className="text-yellow-400 font-bold text-lg mb-1">
                                            Auto-Start Next Set
                                        </label>
                                        <p className="text-gray-300 text-sm">
                                            {autoStartNextSet 
                                                ? 'Set timer starts automatically when rest ends' 
                                                : 'Manually start each set with "Start Set" button'
                                            }
                                        </p>
                                    </div>
                                    <button
                                        onClick={toggleAutoStartNextSet}
                                        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-opacity-75 ${
                                            autoStartNextSet 
                                                ? 'bg-gradient-to-r from-yellow-400 to-orange-600' 
                                                : 'bg-gray-600'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                autoStartNextSet ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                                    sets={incompleteSets}
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
