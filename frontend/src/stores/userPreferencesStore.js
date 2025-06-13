import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useUserPreferencesStore = create(
    devtools(
        persist(
            (set, get) => ({
                // Auto-start preferences
                autoStartNextSet: true, // Default to true (current behavior)

                // Actions
                setAutoStartNextSet: (value) =>
                    set({ autoStartNextSet: value }),

                // Toggle function
                toggleAutoStartNextSet: () =>
                    set((state) => ({
                        autoStartNextSet: !state.autoStartNextSet,
                    })),
            }),
            {
                name: 'user-preferences-storage',
                // Persist all preferences
                partialize: (state) => ({
                    autoStartNextSet: state.autoStartNextSet,
                }),
            }
        ),
        {
            name: 'user-preferences-store',
            enabled: process.env.NODE_ENV === 'development',
        }
    )
)

export default useUserPreferencesStore
