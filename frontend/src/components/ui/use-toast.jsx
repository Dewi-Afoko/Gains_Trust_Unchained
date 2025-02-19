import * as React from 'react'
import { useState, useEffect } from 'react'
import { ToastProvider } from '@radix-ui/react-toast'

// ✅ Custom `useToast()` hook for managing toast notifications
export function useToast() {
    const [toast, setToast] = useState(null)

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(null), 3000) // Auto-dismiss after 3 seconds
    }

    return { toast, showToast }
}

// ✅ Toast container component
export function ToastContainer({ children }) {
    const { toast } = useToast()

    return (
        <ToastProvider>
            {children}
            {toast && (
                <div className="fixed bottom-4 right-4 bg-red-800 text-yellow-300 p-4 rounded-lg shadow-md">
                    {toast}
                </div>
            )}
        </ToastProvider>
    )
}
