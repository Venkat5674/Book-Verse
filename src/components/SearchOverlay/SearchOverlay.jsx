import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiX, FiArrowRight, FiLoader } from 'react-icons/fi'
import localFallbackBooks from '../../data/book'
import './SearchOverlay.css'

const trendingSearches = [
    'Atomic Habits',
    'The Alchemist',
    'Fiction',
    'Psychology of Money',
    'Deep Work',
]

const recentSearches = [
    'Atomic Habits',
    'Harry Potter',
    'The Alchemist',
]

const SearchOverlay = ({ isOpen, onClose }) => {
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const debounceTimerRef = useRef(null)

    const handleClose = useCallback(() => {
        setSearchValue('')
        setSuggestions([])
        setIsSearching(false)
        onClose()
    }, [onClose])

    const handleNavigateToBook = useCallback((bookId, bookObj) => {
        try {
            if (bookObj) {
                sessionStorage.setItem(`bookverse_book_${bookId}`, JSON.stringify(bookObj))
            }
        } catch {}
        handleClose()
        navigate(`/books/${bookId}`, { state: bookObj ? { book: bookObj } : undefined })
    }, [handleClose, navigate])

    // Escape key listener
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, handleClose])

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Live typing suggestions from Open Library Search API & local catalogue
    useEffect(() => {
        const query = searchValue.trim()

        if (query.length < 2) {
            return
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(async () => {
            setIsSearching(true)
            try {
                // 1. Check local catalog first for instant match
                const localMatches = localFallbackBooks
                    .filter((b) =>
                        b.title.toLowerCase().includes(query.toLowerCase()) ||
                        b.author.toLowerCase().includes(query.toLowerCase()) ||
                        b.category.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, 4)

                // 2. Query Open Library Search API
                const response = await fetch(
                    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6`
                )

                if (response.ok) {
                    const data = await response.json()
                    const apiDocs = data.docs || []

                    const apiMatches = apiDocs.map((item, index) => {
                        const title = item.title || 'Untitled Book'
                        const author = item.author_name?.[0] || 'Unknown Author'
                        const coverId = item.cover_i

                        const coverUrl = coverId
                            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                            : localFallbackBooks[index % localFallbackBooks.length].image

                        const basePrice = ((index * 39 + 299) % 450) + 299

                        return {
                            id: item.cover_edition_key || item.key?.replace('/works/', '') || `ol-${index}-${coverId || index}`,
                            title,
                            author,
                            category: item.subject?.[0] || 'Literature',
                            price: basePrice,
                            rating: 4.6,
                            image: coverUrl,
                        }
                    })

                    // Combine local and remote matches (filter duplicates by title)
                    const combined = [...localMatches]
                    apiMatches.forEach((apiBook) => {
                        const exists = combined.some(
                            (b) => b.title.toLowerCase() === apiBook.title.toLowerCase()
                        )
                        if (!exists && combined.length < 6) {
                            combined.push(apiBook)
                        }
                    })

                    setSuggestions(combined)
                } else {
                    setSuggestions(localMatches)
                }
            } catch (err) {
                console.warn('API suggestions fetch error:', err)
                const fallback = localFallbackBooks.filter((b) =>
                    b.title.toLowerCase().includes(query.toLowerCase())
                )
                setSuggestions(fallback)
            } finally {
                setIsSearching(false)
            }
        }, 220)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [searchValue])

    // On clicking Search button or pressing Enter
    const handleSearch = async (event) => {
        event.preventDefault()
        const trimmedValue = searchValue.trim()

        if (!trimmedValue) return

        // 1. If suggestions already exist, direct immediately to the top matching book by its ID!
        if (suggestions.length > 0) {
            handleNavigateToBook(suggestions[0].id, suggestions[0])
            return
        }

        // 2. If suggestions not loaded yet, check local books or fetch top match from API
        const localMatch = localFallbackBooks.find(
            (b) =>
                b.title.toLowerCase().includes(trimmedValue.toLowerCase()) ||
                b.author.toLowerCase().includes(trimmedValue.toLowerCase())
        )

        if (localMatch) {
            handleNavigateToBook(localMatch.id, localMatch)
            return
        }

        // 3. Fallback search on remote API directly
        setIsSearching(true)
        try {
            const res = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmedValue)}&limit=1`
            )
            if (res.ok) {
                const data = await res.json()
                const top = data.docs?.[0]
                if (top) {
                    const topId =
                        top.cover_edition_key ||
                        top.key?.replace('/works/', '') ||
                        `ol-${top.cover_i || 0}`
                    const topBook = {
                        id: topId,
                        title: top.title || trimmedValue,
                        author: top.author_name?.[0] || 'Unknown Author',
                        image: top.cover_i ? `https://covers.openlibrary.org/b/id/${top.cover_i}-M.jpg` : localFallbackBooks[0].image,
                        category: top.subject?.[0] || 'Fiction',
                        price: 399,
                        rating: 4.7,
                    }
                    handleNavigateToBook(topId, topBook)
                    return
                }
            }
        } catch (e) {
            console.warn('Direct search submit error:', e)
        } finally {
            setIsSearching(false)
        }

        // 4. Default: navigate to books catalog with search query
        handleClose()
        navigate(`/books?search=${encodeURIComponent(trimmedValue)}`)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="search-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={handleClose}
                    />

                    <motion.div
                        className="search-overlay"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <div className="search-container">
                            {/* Header */}
                            <div className="search-header">
                                <span className="search-label">SEARCH BOOKVERSE</span>
                                <button
                                    className="search-close"
                                    onClick={handleClose}
                                    aria-label="Close search"
                                >
                                    <FiX />
                                </button>
                            </div>

                            {/* Search Form */}
                            <form className="search-form" onSubmit={handleSearch}>
                                <span className="search-icon">
                                    <FiSearch />
                                </span>

                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    placeholder="Search books, authors, genres..."
                                    autoFocus
                                />

                                {isSearching && (
                                    <span className="search-inline-loader" title="Searching live API">
                                        <FiLoader className="spin-icon" />
                                    </span>
                                )}

                                {searchValue && (
                                    <button
                                        type="button"
                                        className="search-clear"
                                        onClick={() => {
                                            setSearchValue('')
                                            setSuggestions([])
                                        }}
                                        aria-label="Clear input"
                                    >
                                        <FiX />
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="search-submit"
                                    disabled={!searchValue.trim()}
                                >
                                    Search
                                </button>
                            </form>

                            {/* Live Typing Suggestions from API */}
                            {searchValue.trim().length >= 2 ? (
                                <section className="search-section search-suggestions-section">
                                    <div className="search-suggestions-header">
                                        <h3>Matching Books from API</h3>
                                        <span className="search-hint-sub">
                                            Press Enter or click to open book details
                                        </span>
                                    </div>

                                    {suggestions.length > 0 ? (
                                        <div className="search-suggestions-list">
                                            {suggestions.map((book) => (
                                                <button
                                                    key={book.id}
                                                    type="button"
                                                    className="search-suggestion-item"
                                                    onClick={() => handleNavigateToBook(book.id, book)}
                                                >
                                                    <img
                                                        src={book.image}
                                                        alt={book.title}
                                                        className="suggestion-thumb"
                                                    />
                                                    <div className="suggestion-info">
                                                        <span className="suggestion-title">
                                                            {book.title}
                                                        </span>
                                                        <span className="suggestion-author">
                                                            by {book.author}
                                                        </span>
                                                        <div className="suggestion-meta">
                                                            <span className="suggestion-price">
                                                                ₹{book.price}
                                                            </span>
                                                            <span className="suggestion-category">
                                                                {book.category}
                                                            </span>
                                                            <code className="suggestion-id">
                                                                ID: {book.id}
                                                            </code>
                                                        </div>
                                                    </div>
                                                    <span className="suggestion-action-icon">
                                                        <FiArrowRight />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        !isSearching && (
                                            <div className="search-no-results">
                                                <p>
                                                    No books found matching "<strong>{searchValue}</strong>".
                                                </p>
                                                <span className="no-results-hint">
                                                    Try searching for "Atomic Habits", "Alchemist", or "Fiction"
                                                </span>
                                            </div>
                                        )
                                    )}
                                </section>
                            ) : (
                                <>
                                    {/* Trending Searches */}
                                    <section className="search-section">
                                        <h3>Trending searches</h3>
                                        <div className="search-tags">
                                            {trendingSearches.map((item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    className="search-tag"
                                                    onClick={() => setSearchValue(item)}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Recent Searches */}
                                    <section className="search-section">
                                        <h3>Popular recommendations</h3>
                                        <div className="recent-searches">
                                            {recentSearches.map((item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    className="recent-search"
                                                    onClick={() => setSearchValue(item)}
                                                >
                                                    <span>{item}</span>
                                                    <span>→</span>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Browse Catalog Link */}
                                    <Link
                                        to="/books"
                                        className="search-browse"
                                        onClick={handleClose}
                                    >
                                        Browse all books
                                        <span>→</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default SearchOverlay