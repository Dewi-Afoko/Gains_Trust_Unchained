import { useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts'
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog'
import PanelHeader from '../ui/PanelHeader'
import PanelButton from '../ui/PanelButton'
import WeightLogForm from './WeightLogForm'
import { Scale, Plus } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-brand-dark-2 border border-brand-gold/50 p-3 rounded-lg shadow-xl backdrop-blur-sm">
                <p className="text-brand-gold font-medium uppercase tracking-wider text-sm">
                    {label}
                </p>
                <p className="text-white font-bold text-lg mt-1">
                    {payload[0].value} kg
                </p>
            </div>
        )
    }
    return null
}

const UserWeightCard = ({ weights, onWeightUpdate }) => {
    const [isLogWeightModalOpen, setIsLogWeightModalOpen] = useState(false)

    const formattedWeights = [...weights].reverse().map((w) => ({
        date: new Date(w.date_recorded).toLocaleDateString(),
        weight: parseFloat(w.weight),
    }))

    // Calculate min and max for better visualization
    const minWeight =
        formattedWeights.length > 0
            ? Math.min(...formattedWeights.map((w) => w.weight))
            : 0
    const maxWeight =
        formattedWeights.length > 0
            ? Math.max(...formattedWeights.map((w) => w.weight))
            : 0
    const padding =
        formattedWeights.length > 0 ? (maxWeight - minWeight) * 0.1 : 0

    // Calculate weight change
    const weightChange =
        formattedWeights.length >= 2
            ? (
                  formattedWeights[formattedWeights.length - 1].weight -
                  formattedWeights[0].weight
              ).toFixed(1)
            : 0

    const getWeightChangeColor = (change) => {
        if (change > 0) return 'text-brand-green'
        if (change < 0) return 'text-brand-red'
        return 'text-gray-400'
    }

    const handleWeightLogged = (newWeight) => {
        setIsLogWeightModalOpen(false)
        // Notify parent component to refresh weight data
        if (onWeightUpdate) {
            onWeightUpdate()
        }
    }

    return (
        <div className="flex flex-col h-full w-full">
            <PanelHeader title="Weight Tracking" icon={Scale} />
            {weights.length > 0 ? (
                <>
                    {/* Weight Graph */}
                    <div className="relative w-full flex-1 min-h-[180px] p-2 bg-black/20 rounded-lg border border-brand-gold/30 hover:border-brand-gold/50 transition-all">
                        {/* Corner Rivets */}
                        <div className="absolute left-1 top-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                        <div className="absolute right-1 top-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                        <div className="absolute left-1 bottom-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />
                        <div className="absolute right-1 bottom-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70" />

                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={formattedWeights}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="weightLine"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#FFD700"
                                            stopOpacity={0.9}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#D35400"
                                            stopOpacity={0.4}
                                        />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur
                                            stdDeviation="2"
                                            result="coloredBlur"
                                        />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#FFD700"
                                    tick={{ fill: '#FFD700', fontSize: 12 }}
                                    tickLine={{ stroke: '#FFD700' }}
                                    style={{ filter: 'url(#glow)' }}
                                />
                                <YAxis
                                    domain={[
                                        Math.floor(minWeight - padding),
                                        Math.ceil(maxWeight + padding),
                                    ]}
                                    stroke="#FFD700"
                                    tick={{ fill: '#FFD700', fontSize: 12 }}
                                    tickLine={{ stroke: '#FFD700' }}
                                    style={{ filter: 'url(#glow)' }}
                                    tickFormatter={(value) => `${Math.round(value)}kg`}
                                    interval="preserveStartEnd"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine
                                    y={formattedWeights[0]?.weight}
                                    stroke="#FFD700"
                                    strokeDasharray="3 3"
                                    strokeOpacity={0.3}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="url(#weightLine)"
                                    strokeWidth={3}
                                    dot={{
                                        stroke: '#FFD700',
                                        strokeWidth: 2,
                                        r: 4,
                                        fill: '#2d0000',
                                        filter: 'url(#glow)',
                                    }}
                                    activeDot={{
                                        stroke: '#FFD700',
                                        strokeWidth: 2,
                                        r: 6,
                                        fill: '#D35400',
                                        filter: 'url(#glow)',
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Last Recorded Weight with Change */}
                    <div className="mt-4 p-4 bg-black/30 rounded-lg border border-brand-gold/30 hover:border-brand-gold/50 transition-all">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-brand-gold/70 text-sm font-semibold uppercase tracking-wider">
                                    Latest Weight
                                </h3>
                                <div className="text-white text-xl font-bold mt-1">
                                    {
                                        formattedWeights[
                                            formattedWeights.length - 1
                                        ].weight
                                    }{' '}
                                    kg
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-brand-gold/70 text-sm font-semibold uppercase tracking-wider">
                                    Total Change
                                </h3>
                                <div
                                    className={`text-xl font-bold mt-1 ${getWeightChangeColor(weightChange)}`}
                                >
                                    {weightChange > 0 ? '+' : ''}
                                    {weightChange} kg
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <p className="text-brand-gold/70 uppercase tracking-wider font-medium text-center">
                        No weight records found.
                    </p>
                    <p className="text-gray-400 text-sm text-center">
                        Start tracking your weight progress by logging your
                        first entry!
                    </p>
                </div>
            )}

            {/* Log Weight Button */}
            <div className="mt-auto pt-4">
                <Dialog
                    open={isLogWeightModalOpen}
                    onOpenChange={setIsLogWeightModalOpen}
                >
                    <DialogTrigger asChild>
                        <PanelButton
                            variant="gold"
                            className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Log Weight
                        </PanelButton>
                    </DialogTrigger>
                    <DialogContent
                        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4"
                        onInteractOutside={() => setIsLogWeightModalOpen(false)}
                    >
                        <div className="w-full max-w-lg bg-brand-dark-2/90 backdrop-blur-sm rounded-xl border border-brand-gold/30 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                            <WeightLogForm
                                onClose={() => setIsLogWeightModalOpen(false)}
                                onUpdate={handleWeightLogged}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default UserWeightCard
