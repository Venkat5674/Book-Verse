import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { FiSearch, FiX, FiGrid, FiList, FiSliders, FiStar } from 'react-icons/fi'
import BookCard from '../components/BookCard/BookCard'
import localFallbackBooks from '../data/book'
import './Books.css'

const CATEGORIES = [
    'All',
    'Fiction',
    'Non-Fiction',
    'Self Help',
    'Romance',
    'Mystery & Thriller',
    'Fantasy',
    'Sci-Fi',
    'Business',
    'Psychology',
    'History',
    'Biography',
    'Young Readers',
]

// Map sub-genres (from MegaMenu) to Open Library subjects
const GENRE_SUBJECT_MAP = {
    'literary-fiction': 'literary_fiction',
    'romance': 'romance',
    'mystery-thriller': 'mystery_and_detective_stories',
    'fantasy': 'fantasy',
    'sci-fi': 'science_fiction',
    'self-help': 'self-help',
    'biography': 'biography',
    'business': 'business',
    'psychology': 'psychology',
    'history': 'history',
    'childrens-books': 'children',
    'young-adult': 'young_adult_fiction',
    'picture-books': 'picture_books',
    'educational': 'education',
    'activity-books': 'activity_books',
}

// Friendly titles for genres
const GENRE_LABELS = {
    'literary-fiction': 'Literary Fiction',
    'romance': 'Romance',
    'mystery-thriller': 'Mystery & Thriller',
    'fantasy': 'Fantasy',
    'sci-fi': 'Science Fiction',
    'self-help': 'Self Help',
    'biography': 'Biography',
    'business': 'Business',
    'psychology': 'Psychology',
    'history': 'History',
    'childrens-books': "Children's Books",
    'young-adult': 'Young Adult',
    'picture-books': 'Picture Books',
    'educational': 'Educational',
    'activity-books': 'Activity Books',
}

// Map top-level categories to Open Library subjects
const CATEGORY_SUBJECT_MAP = {
    'fiction': 'fiction',
    'non-fiction': 'nonfiction',
    'young-readers': 'young_adult_fiction',
    'self-help': 'self-help',
    'business': 'business',
    'finance': 'finance',
    'fantasy': 'fantasy',
    'romance': 'romance',
    'sci-fi': 'science_fiction',
    'philosophy': 'philosophy',
    'biography': 'biography',
    'psychology': 'psychology',
    'history': 'history',
    'productivity': 'management',
    // Title Case aliases
    'Fiction': 'fiction',
    'Non-Fiction': 'nonfiction',
    'Self Help': 'self-help',
    'Business': 'business',
    'Finance': 'finance',
    'Fantasy': 'fantasy',
    'Romance': 'romance',
    'Productivity': 'management',
    'Young Readers': 'young_adult_fiction',
    'Biography': 'biography',
    'Philosophy': 'philosophy',
    'Psychology': 'psychology',
    'History': 'history',
}

// Friendly titles for categories
const CATEGORY_LABELS = {
    'fiction': 'Fiction',
    'non-fiction': 'Non-Fiction',
    'young-readers': 'Young Readers',
    'self-help': 'Self Help',
    'business': 'Business',
    'finance': 'Finance',
    'fantasy': 'Fantasy',
    'romance': 'Romance',
    'sci-fi': 'Science Fiction',
    'philosophy': 'Philosophy',
    'biography': 'Biography',
    'psychology': 'Psychology',
    'history': 'History',
    'productivity': 'Productivity',
}

const Books = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // URL parameters derived directly
    const selectedCategory = searchParams.get('category') || ''
    const selectedGenre = searchParams.get('genre') || ''
    const sortBy = searchParams.get('sort') || 'featured'
    const activeSearch = searchParams.get('search') || ''

    // Local UI state
    const [books, setBooks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchInput, setSearchInput] = useState(activeSearch)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [maxPrice, setMaxPrice] = useState(1000)
    const [minRating, setMinRating] = useState(0)
    const [viewMode, setViewMode] = useState('grid')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    // Compute active display label
    const activeDisplayLabel = useMemo(() => {
        if (activeSearch) return `Search: "${activeSearch}"`
        if (selectedGenre && GENRE_LABELS[selectedGenre]) return GENRE_LABELS[selectedGenre]
        if (selectedCategory && CATEGORY_LABELS[selectedCategory]) return CATEGORY_LABELS[selectedCategory]
        if (selectedCategory && selectedCategory !== 'All') return selectedCategory
        return 'All Books'
    }, [activeSearch, selectedGenre, selectedCategory])

    // Fetch real books from Open Library API asynchronously
    useEffect(() => {
        let ignore = false
        const controller = new AbortController()

        const executeFetch = async () => {
            setIsLoading(true)
            try {
                let url = ''
                const hasQuery = Boolean(activeSearch && activeSearch.trim())

                if (hasQuery) {
                    url = `https://openlibrary.org/search.json?q=${encodeURIComponent(activeSearch.trim())}&limit=28`
                } else if (selectedGenre && GENRE_SUBJECT_MAP[selectedGenre]) {
                    url = `https://openlibrary.org/subjects/${GENRE_SUBJECT_MAP[selectedGenre]}.json?limit=28`
                } else if (selectedCategory && CATEGORY_SUBJECT_MAP[selectedCategory]) {
                    url = `https://openlibrary.org/subjects/${CATEGORY_SUBJECT_MAP[selectedCategory]}.json?limit=28`
                } else if (selectedCategory && selectedCategory !== 'All') {
                    const slug = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '_')
                    url = `https://openlibrary.org/subjects/${slug}.json?limit=28`
                } else {
                    url = `https://openlibrary.org/subjects/bestseller.json?limit=28`
                }

                const response = await fetch(url, { signal: controller.signal })
                if (!response.ok) {
                    throw new Error(`Failed to fetch books: ${response.statusText}`)
                }

                const data = await response.json()
                const rawList = data.works || data.docs || []

                // Current category name for card badges
                const cardCategoryLabel = selectedGenre
                    ? (GENRE_LABELS[selectedGenre] || selectedGenre)
                    : selectedCategory && selectedCategory !== 'All'
                    ? (CATEGORY_LABELS[selectedCategory] || selectedCategory)
                    : null

                // Normalize Open Library works/docs into our standard book card shape
                const normalized = rawList.map((item, index) => {
                    const title = item.title || 'Untitled Book'
                    const author = item.authors?.[0]?.name || item.author_name?.[0] || 'Unknown Author'
                    const coverId = item.cover_id || item.cover_i

                    // Cover image from Open Library Cover API
                    const coverUrl = coverId
                        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                        : localFallbackBooks[index % localFallbackBooks.length].image

                    // Realistic bookstore pricing and ratings for e-commerce
                    const basePrice = ((index * 37 + 199) % 500) + 299
                    const originalPrice = basePrice + 200 + ((index * 20) % 300)
                    const rating = Number((4.1 + ((index * 3) % 9) * 0.1).toFixed(1))
                    const reviews = 450 + ((index * 193) % 8500)

                    const badges = ['Bestseller', 'Staff Pick', 'Popular', 'Trending', 'New Release']
                    const badge = badges[index % badges.length]

                    return {
                        id: item.cover_edition_key || item.key?.replace('/works/', '') || `ol-${index}-${coverId || index}`,
                        title,
                        author,
                        category: cardCategoryLabel || item.subject?.[0] || 'Fiction',
                        price: basePrice,
                        originalPrice,
                        rating,
                        reviews,
                        image: coverUrl,
                        badge,
                        firstPublishYear: item.first_publish_year || 2020,
                    }
                })

                if (!ignore) {
                    const finalBooks = normalized.length ? normalized : localFallbackBooks
                    try {
                        finalBooks.forEach((b) => {
                            sessionStorage.setItem(`bookverse_book_${b.id}`, JSON.stringify(b))
                        })
                    } catch {}
                    setBooks(finalBooks)
                    setError(null)
                    setIsLoading(false)
                }
            } catch (err) {
                if (err.name === 'AbortError') return
                console.error('Error fetching real books from Open Library:', err)
                if (!ignore) {
                    setError('Could not connect to the remote catalog. Showing our offline curated shelf.')
                    setBooks(localFallbackBooks)
                    setIsLoading(false)
                }
            }
        }

        executeFetch()

        return () => {
            ignore = true
            controller.abort()
        }
    }, [activeSearch, selectedCategory, selectedGenre])

    // Live typing suggestions from current catalog and fallback
    const matchingSuggestions = useMemo(() => {
        const q = searchInput.trim().toLowerCase()
        if (q.length < 2) return []
        const currentList = books.length > 0 ? books : localFallbackBooks
        return currentList
            .filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
            .slice(0, 5)
    }, [searchInput, books])

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault()
        setShowSuggestions(false)
        const q = searchInput.trim()
        if (!q) return

        // Direct to particular book page based on ID if there is a matching book
        const directMatch = matchingSuggestions[0] ||
            books.find((b) => b.title.toLowerCase().includes(q.toLowerCase())) ||
            localFallbackBooks.find((b) => b.title.toLowerCase().includes(q.toLowerCase()))

        if (directMatch) {
            try {
                sessionStorage.setItem(`bookverse_book_${directMatch.id}`, JSON.stringify(directMatch))
            } catch {}
            navigate(`/books/${directMatch.id}`, { state: { book: directMatch } })
            return
        }

        setIsLoading(true)
        const newParams = new URLSearchParams(searchParams)
        newParams.set('search', q)
        setSearchParams(newParams)
    }

    // Handle category pill click
    const handleCategoryClick = (category) => {
        setIsLoading(true)
        const newParams = new URLSearchParams(searchParams)
        if (category === 'All') {
            newParams.delete('category')
        } else {
            newParams.set('category', category)
        }
        setSearchParams(newParams)
    }

    // Handle sort change
    const handleSortChange = (e) => {
        const val = e.target.value
        const newParams = new URLSearchParams(searchParams)
        if (val === 'featured') {
            newParams.delete('sort')
        } else {
            newParams.set('sort', val)
        }
        setSearchParams(newParams)
    }

    // Handle clear search
    const handleClearSearch = () => {
        setIsLoading(true)
        setSearchInput('')
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('search')
        setSearchParams(newParams)
    }

    // Reset all filters
    const handleResetAll = () => {
        setIsLoading(true)
        setSearchInput('')
        setMaxPrice(1000)
        setMinRating(0)
        setSearchParams({})
    }

    // Filter and Sort in-memory
    const filteredBooks = useMemo(() => {
        return books
            .filter((book) => {
                // Price filter
                if (book.price > maxPrice) return false
                // Rating filter
                if (book.rating < minRating) return false
                return true
            })
            .sort((a, b) => {
                if (sortBy === 'price-low') return a.price - b.price
                if (sortBy === 'price-high') return b.price - a.price
                if (sortBy === 'rating') return b.rating - a.rating
                if (sortBy === 'newest') return (b.firstPublishYear || 0) - (a.firstPublishYear || 0)
                return 0 // 'featured' keep original API order
            })
    }, [books, maxPrice, minRating, sortBy])

    // Helper to check if a category pill is active
    const isPillActive = (cat) => {
        if (cat === 'All') {
            return (!selectedCategory || selectedCategory === 'All') && !selectedGenre
        }
        const cleanCat = cat.toLowerCase().replace(/[^a-z0-9]/g, '')
        const cleanSelectedCat = (selectedCategory || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        const cleanSelectedGenre = (selectedGenre || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        return cleanCat === cleanSelectedCat || cleanCat === cleanSelectedGenre
    }

    return (
        <main className="books-page">
            {/* Header Section */}
            <header className="books-header">
                <div className="books-header-container">
                    <span className="books-eyebrow">
                        {selectedGenre
                            ? `GENRE • ${(GENRE_LABELS[selectedGenre] || selectedGenre).toUpperCase()}`
                            : selectedCategory && selectedCategory !== 'All'
                            ? `CATEGORY • ${(CATEGORY_LABELS[selectedCategory] || selectedCategory).toUpperCase()}`
                            : 'EXPLORE OUR SHELVES'}
                    </span>
                    <h1>{activeDisplayLabel}</h1>
                    <p>
                        {selectedGenre
                            ? `Explore the finest ${activeDisplayLabel} books fetched live from the international catalogue.`
                            : selectedCategory && selectedCategory !== 'All'
                            ? `Handpicked collection of ${activeDisplayLabel} books curated for your reading journey.`
                            : 'Live real-time collection fetched directly from the Open Library public catalogue.'}
                    </p>

                    {/* Search Form with Live Typing Suggestions */}
                    <div className="books-search-wrapper">
                        <form className="books-search-form" onSubmit={handleSearchSubmit}>
                            <FiSearch className="books-search-icon" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value)
                                    setShowSuggestions(true)
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Search by title, author, or keyword..."
                                aria-label="Search books"
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    className="books-clear-btn"
                                    onClick={() => {
                                        handleClearSearch()
                                        setShowSuggestions(false)
                                    }}
                                    aria-label="Clear search"
                                >
                                    <FiX />
                                </button>
                            )}
                            <button type="submit" className="books-search-submit">
                                Search
                            </button>
                        </form>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && matchingSuggestions.length > 0 && (
                            <div className="books-live-suggestions-dropdown">
                                <span className="dropdown-label">Matching books (click to open):</span>
                                {matchingSuggestions.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="books-suggestion-row"
                                        onClick={() => {
                                            setShowSuggestions(false)
                                            try {
                                                sessionStorage.setItem(`bookverse_book_${item.id}`, JSON.stringify(item))
                                            } catch {}
                                            navigate(`/books/${item.id}`, { state: { book: item } })
                                        }}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="books-suggestion-thumb"
                                        />
                                        <div className="books-suggestion-info">
                                            <span className="books-suggestion-title">
                                                {item.title}
                                            </span>
                                            <span className="books-suggestion-author">
                                                by {item.author}
                                            </span>
                                            <span className="books-suggestion-meta">
                                                ₹{item.price} • ID: {item.id}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Category Navigation Bar */}
            <nav className="books-category-bar" aria-label="Book Categories">
                <div className="books-category-container">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`category-pill ${isPillActive(cat) ? 'is-active' : ''}`}
                            onClick={() => handleCategoryClick(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content Layout */}
            <div className="books-layout-container">

                {/* Filter Sidebar (Desktop) */}
                <aside className={`books-sidebar ${showMobileFilters ? 'is-open' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Filters</h3>
                        <button
                            type="button"
                            className="sidebar-close-btn"
                            onClick={() => setShowMobileFilters(false)}
                            aria-label="Close filters"
                        >
                            <FiX />
                        </button>
                    </div>

                    {/* Price Filter */}
                    <div className="filter-group">
                        <label className="filter-label" htmlFor="price-range">
                            <span>Max Price</span>
                            <strong>₹{maxPrice}</strong>
                        </label>
                        <input
                            id="price-range"
                            type="range"
                            min="200"
                            max="1000"
                            step="50"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="price-slider"
                        />
                        <div className="filter-range-ticks">
                            <span>₹200</span>
                            <span>₹1000</span>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-group">
                        <span className="filter-label">Customer Rating</span>
                        <div className="rating-options">
                            {[0, 4.0, 4.5].map((rate) => (
                                <button
                                    key={rate}
                                    type="button"
                                    className={`rating-option-btn ${minRating === rate ? 'is-active' : ''}`}
                                    onClick={() => setMinRating(rate)}
                                >
                                    {rate === 0 ? 'All Ratings' : (
                                        <>
                                            <span>{rate}+</span>
                                            <FiStar className="star-icon" />
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reset Button */}
                    <button
                        type="button"
                        className="reset-filters-btn"
                        onClick={handleResetAll}
                    >
                        Clear All Filters
                    </button>
                </aside>

                {/* Content Area */}
                <section className="books-content-area">

                    {/* Control Toolbar */}
                    <div className="books-toolbar">
                        <div className="toolbar-left">
                            <button
                                type="button"
                                className="mobile-filter-trigger"
                                onClick={() => setShowMobileFilters(true)}
                            >
                                <FiSliders />
                                <span>Filters</span>
                            </button>

                            <span className="results-count">
                                {isLoading ? 'Fetching library...' : `Showing ${filteredBooks.length} titles`}
                            </span>
                        </div>

                        <div className="toolbar-right">
                            {/* Sort Dropdown */}
                            <div className="sort-wrapper">
                                <label htmlFor="sort-dropdown">Sort by:</label>
                                <select
                                    id="sort-dropdown"
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="sort-select"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="newest">Newest Releases</option>
                                </select>
                            </div>

                            {/* View Switcher */}
                            <div className="view-switcher" role="group" aria-label="Layout view">
                                <button
                                    type="button"
                                    className={`view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid layout"
                                >
                                    <FiGrid />
                                </button>
                                <button
                                    type="button"
                                    className={`view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    aria-label="List layout"
                                >
                                    <FiList />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notice if error/fallback occurred */}
                    {error && (
                        <div className="books-notice-banner" role="status">
                            {error}
                        </div>
                    )}

                    {/* Loading Skeletons */}
                    {isLoading && (
                        <div className={`books-catalog-grid ${viewMode === 'list' ? 'is-list-view' : ''}`}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="book-skeleton-card">
                                    <div className="skeleton-image-box" />
                                    <div className="skeleton-content">
                                        <div className="skeleton-line short" />
                                        <div className="skeleton-line title" />
                                        <div className="skeleton-line medium" />
                                        <div className="skeleton-line button" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loaded Books Catalog */}
                    {!isLoading && filteredBooks.length > 0 && (
                        <motion.div
                            className={`books-catalog-grid ${viewMode === 'list' ? 'is-list-view' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {filteredBooks.map((book) => (
                                <div key={book.id} className="books-grid-item">
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredBooks.length === 0 && (
                        <div className="books-empty-state">
                            <div className="empty-icon">📖</div>
                            <h3>No books found matching your criteria</h3>
                            <p>Try adjusting your search terms, clearing filters, or browsing a different category.</p>
                            <button
                                type="button"
                                className="empty-reset-btn"
                                onClick={handleResetAll}
                            >
                                Reset all filters
                            </button>
                        </div>
                    )}

                </section>

            </div>
        </main>
    )
}

export default Books
