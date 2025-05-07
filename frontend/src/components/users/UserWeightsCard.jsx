import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

const UserWeightCard = ({ weights }) => {
    const formattedWeights = [...weights] // Clone array
        .reverse() // Reverse order (latest first)
        .map((w) => ({
            date: new Date(w.date_recorded).toLocaleDateString(),
            weight: parseFloat(w.weight),
        }))

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-brand-gold text-xl font-bold mb-4">Weight Tracking</h2>
            {weights.length > 0 ? (
                <>
                    {/* Weight Graph */}
                    <div className="w-full flex-1 min-h-[180px] h-full" style={{ minHeight: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedWeights} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#FFD700"
                                    tick={{ dy: 15, fill: '#FFD700' }}
                                />
                                <YAxis
                                    stroke="#FFD700"
                                    tick={{ dx: -5, fill: '#FFD700' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#2d0000',
                                        color: 'white',
                                        borderRadius: '5px',
                                        padding: '8px',
                                        border: '1px solid #FFD700',
                                    }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#FFD700"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#FFD700' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Last Recorded Weight */}
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-brand-gold">
                            Last Recorded Weight
                        </h3>
                        <div className="mt-2 text-white">
                            <strong>{formattedWeights[0].date}:</strong> {formattedWeights[0].weight} kg
                        </div>
                    </div>
                </>
            ) : (
                <p className="text-white">No weight records found.</p>
            )}
        </div>
    )
}

export default UserWeightCard
