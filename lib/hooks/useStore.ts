import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'


interface StoreState {
    likedDogs: string[]
    addLikedDog: (dogId: string) => void
    removeLikedDog: (dogId: string) => void
    updateLikedDogs: (newDogs: string[]) => void
    emptyLikedDogs: () => void
}

const useStore = create<StoreState>()(
    persist(
        (set) => ({
            likedDogs: [],
            addLikedDog: (dogId: string) => set((state: StoreState) => ({
                likedDogs: [...state.likedDogs, dogId]
            })),
            removeLikedDog: (dogId: string) => set((state: StoreState) => ({
                likedDogs: state.likedDogs.filter(id => id !== dogId)
            })),
            updateLikedDogs: (newDogs: string[]) => set({ likedDogs: newDogs }),
            emptyLikedDogs: () => set({ likedDogs: [] })
        }),
        {
            name: 'likedDogs',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export default useStore
