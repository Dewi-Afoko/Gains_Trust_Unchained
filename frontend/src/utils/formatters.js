// ✅ New function to format datetime to HH:MM - YYYY/MM/DD
export function formatDateTime(isoString) {
    if (!isoString) return 'N/A' // Handle null values

    const date = new Date(isoString)

    // Extract required parts
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // JS months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0')

    return `${hours}:${minutes} - ${year}/${month}/${day}`
}

export const formatLoading = (loading) => {
    if (!loading || loading === 0) return "Bodyweight"; // ✅ Replace blank with "Bodyweight"
    return `${loading}kg`; // ✅ Append kg only if loading is set
};
