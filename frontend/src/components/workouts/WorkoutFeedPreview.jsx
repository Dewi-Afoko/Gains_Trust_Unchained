import { useEffect, useState, useRef, useCallback } from 'react'
import { getWorkouts } from '../../api/workoutsApi'

const PAGE_SIZE = 5

const WorkoutFeedPreview = ({ setWorkoutId, maxHeight = '320px' }) => {
    const [workouts, setWorkouts] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const listRef = useRef(null)

    const fetchWorkouts = useCallback(async (pageNum) => {
        setLoading(true)
        setError(null)
        try {
            const data = await getWorkouts({ page: pageNum, page_size: PAGE_SIZE })
            if (pageNum === 1) {
                setWorkouts(data.results)
            } else {
                setWorkouts((prev) => [...prev, ...data.results])
            }
            setHasMore(Boolean(data.next))
        } catch (err) {
            setError('Failed to load workouts')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchWorkouts(page)
    }, [page, fetchWorkouts])

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const el = listRef.current
            if (!el || loading || !hasMore) return
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                setPage((prev) => prev + 1)
            }
        }
        const el = listRef.current
        if (el) {
            el.addEventListener('scroll', handleScroll)
        }
        return () => {
            if (el) {
                el.removeEventListener('scroll', handleScroll)
            }
        }
    }, [loading, hasMore])

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-xl font-bold text-brand-gold mb-4">Your Workouts</h2>
            <div
                ref={listRef}
                className="space-y-3 pr-2 overflow-y-auto"
                style={{ minHeight: 180, maxHeight }}
            >
                {workouts.length > 0 ? (
                    <ul>
                        {workouts.map((workout) => (
                            <li
                                key={workout.id}
                                className="bg-brand-dark-1 p-3 rounded-lg cursor-pointer hover:bg-brand-dark-2 transition border border-brand-gold/30 mb-2"
                                onClick={() => setWorkoutId(workout.id)}
                            >
                                <strong>{workout.workout_name}</strong> -{' '}
                                {new Date(workout.date).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                ) : loading ? (
                    <p className="text-white">Loading workouts...</p>
                ) : (
                    <p className="text-white">No workouts found.</p>
                )}
                {error && <p className="text-brand-red">{error}</p>}
                {loading && workouts.length > 0 && (
                    <p className="text-brand-gold text-center">Loading more...</p>
                )}
                {!hasMore && workouts.length > 0 && (
                    <p className="text-brand-gold text-center opacity-60">End of Workouts List</p>
                )}
            </div>
        </div>
    )
}

export default WorkoutFeedPreview
