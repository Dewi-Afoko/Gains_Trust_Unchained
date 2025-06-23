// ✅ Format datetime to DD/MM/YYYY - HH:MM
export function formatDateTime(isoString) {
    if (!isoString) return 'N/A' // Handle null values

    const date = new Date(isoString)

    // Extract required parts
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // JS months are 0-indexed
    const year = date.getFullYear()

    return `${day}/${month}/${year} - ${hours}:${minutes}`
}

// ✅ Format duration from seconds to HH:MM:SS
export function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '00:00:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const pad = (num) => String(num).padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
}

export const formatLoading = (loading) => {
    if (!loading || loading === 0) return 'Bodyweight' // ✅ Replace blank with "Bodyweight"
    return `${loading}kg` // ✅ Append kg only if loading is set
}
