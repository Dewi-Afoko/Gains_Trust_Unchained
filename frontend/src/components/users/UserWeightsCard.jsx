import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
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
        <Card className="w-full max-w-2xl bg-[#600000] border border-yellow-400 shadow-lg">
            <CardHeader>
                <CardTitle className="text-yellow-400">
                    Weight Tracking
                </CardTitle>
            </CardHeader>
            <CardContent>
                {weights.length > 0 ? (
                    <>
                        {/* Weight Graph */}
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={formattedWeights}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#FFD700"
                                    tick={{ dy: 15 }}
                                />
                                <YAxis stroke="#FFD700" tick={{ dx: -5 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#400000',
                                        color: 'white',
                                        borderRadius: '5px',
                                        padding: '8px',
                                    }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#FFD700"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>

                        {/* Last 5 Weigh-ins */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-yellow-400">
                                Last 5 Weigh-Ins
                            </h3>
                            <ul className="mt-2 space-y-1">
                                {formattedWeights
                                    .slice(0, 5)
                                    .map((w, index) => (
                                        <li key={index} className="text-white">
                                            <strong>{w.date}:</strong>{' '}
                                            {w.weight} kg
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <p>No weight records found.</p>
                )}
            </CardContent>
        </Card>
    )
}

export default UserWeightCard
