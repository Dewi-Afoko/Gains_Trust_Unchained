const SetsTableHeader = () => {
    const headers = [
        'Exercise',
        'Set Sequence',
        'Set Count',
        'Set Type',
        'Loading (kg)',
        'Reps',
        'Rest (s)',
        'Focus',
        'Notes',
        'Complete',
        'Actions',
    ]

    return (
        <thead>
            <tr className="bg-[#500000] text-yellow-400">
                {headers.map((header, index) => (
                    <th key={index} className="border border-yellow-400 p-2">
                        {header}
                    </th>
                ))}
            </tr>
        </thead>
    )
}

export default SetsTableHeader
