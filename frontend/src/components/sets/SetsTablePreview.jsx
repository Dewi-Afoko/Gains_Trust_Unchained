import { formatLoading } from '../../utils/formatters'
import { useState } from 'react'
import {
    Root as PopoverRoot,
    Trigger as PopoverTrigger,
    Content as PopoverContent,
} from '@radix-ui/react-popover'

const SetsTablePreview = ({ sets }) => {
    const [selectedSetId, setSelectedSetId] = useState(null)

    if (!sets || sets.length === 0) {
        return <p className="text-white mt-4">No sets available.</p>
    }
    console.log('sets', sets)

    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse border border-yellow-400">
                <thead>
                    <tr className="bg-[#500000] text-yellow-400">
                        <th className="border border-yellow-400 p-2">
                            Exercise
                        </th>
                        <th className="border border-yellow-400 p-2">
                            Set Count
                        </th>
                        <th className="border border-yellow-400 p-2">
                            Set Type
                        </th>
                        <th className="border border-yellow-400 p-2">
                            Loading
                        </th>
                        <th className="border border-yellow-400 p-2">Reps</th>
                        <th className="border border-yellow-400 p-2">
                            Rest (s)
                        </th>
                        <th className="border border-yellow-400 p-2">Focus</th>
                        <th className="border border-yellow-400 p-2">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {sets.map((set, index) => {
                        console.log(`set ${index}:`, {
                            setId: set.id,
                            workoutId: set.workout,
                        })

                        return (
                            <tr key={index} className="text-white">
                                <td className="border border-yellow-400 p-2">
                                    {set.exercise_name}
                                </td>
                                <td className="border border-yellow-400 p-2 text-center">
                                    {set.set_number}
                                </td>
                                <td className="border border-yellow-400 p-2 text-center">
                                    {set.set_type || 'N/A'}
                                </td>
                                <td className="border border-yellow-400 p-2 text-center">
                                    {formatLoading(set.loading)}
                                </td>
                                <td className="border border-yellow-400 p-2 text-center">
                                    {set.reps || 'N/A'}
                                </td>
                                <td className="border border-yellow-400 p-2 text-center">
                                    {set.rest || 'N/A'}
                                </td>
                                <td className="border border-yellow-400 p-2">
                                    {set.focus || 'N/A'}
                                </td>
                                <td className="border border-yellow-400 p-2">
                                    {set.notes || 'N/A'}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default SetsTablePreview
