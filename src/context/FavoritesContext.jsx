import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const FavoritesContext = createContext()

const STORAGE_KEY = 'bookverse_favorites'

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return saved ? JSON.parse(saved) : []
        } catch (err) {
            console.error('Error reading favorites from localStorage:', err)
            return []
        }
    })

    // Sync to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
        } catch (err) {
            console.error('Error saving favorites to localStorage:', err)
        }
    }, [favorites])

    const isFavorite = useCallback(
        (bookId) => {
            if (!bookId) return false
            return favorites.some((item) => String(item.id) === String(bookId))
        },
        [favorites]
    )

    const addFavorite = useCallback((book) => {
        if (!book || !book.id) return
        setFavorites((prev) => {
            if (prev.some((item) => String(item.id) === String(book.id))) {
                return prev
            }
            const cleanBook = {
                id: book.id,
                title: book.title || 'Untitled Book',
                author: book.author || 'Unknown Author',
                price: Number(book.price) || 299,
                originalPrice: Number(book.originalPrice) || (Number(book.price) || 299) + 150,
                rating: Number(book.rating) || 4.5,
                reviews: Number(book.reviews) || 120,
                image: book.image || '',
                category: book.category || 'General',
                badge: book.badge || '',
            }
            return [cleanBook, ...prev]
        })
    }, [])

    const removeFavorite = useCallback((bookId) => {
        if (!bookId) return
        setFavorites((prev) => prev.filter((item) => String(item.id) !== String(bookId)))
    }, [])

    const toggleFavorite = useCallback((book) => {
        if (!book || !book.id) return
        setFavorites((prev) => {
            const exists = prev.some((item) => String(item.id) === String(book.id))
            if (exists) {
                return prev.filter((item) => String(item.id) !== String(book.id))
            } else {
                const cleanBook = {
                    id: book.id,
                    title: book.title || 'Untitled Book',
                    author: book.author || 'Unknown Author',
                    price: Number(book.price) || 299,
                    originalPrice: Number(book.originalPrice) || (Number(book.price) || 299) + 150,
                    rating: Number(book.rating) || 4.5,
                    reviews: Number(book.reviews) || 120,
                    image: book.image || '',
                    category: book.category || 'General',
                    badge: book.badge || '',
                }
                return [cleanBook, ...prev]
            }
        })
    }, [])

    const clearFavorites = useCallback(() => {
        setFavorites([])
    }, [])

    const value = useMemo(
        () => ({
            favorites,
            favoritesCount: favorites.length,
            isFavorite,
            addFavorite,
            removeFavorite,
            toggleFavorite,
            clearFavorites,
        }),
        [favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites]
    )

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

// Custom hook to consume FavoritesContext
// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider')
    }
    return context
}
