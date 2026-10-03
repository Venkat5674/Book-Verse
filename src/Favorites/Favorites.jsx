import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
    FiHeart,
    FiTrash2,
    FiShoppingBag,
    FiArrowRight,
    FiArrowLeft,
    FiCheck,
    FiSliders,
} from 'react-icons/fi'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'
import BookCard from '../components/BookCard/BookCard'
import './Favorites.css'

const Favorites = () => {
    const { favorites, clearFavorites } = useFavorites()
    const { addToCart } = useCart()

    const [sortBy, setSortBy] = useState('recent')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [addedAllFeedback, setAddedAllFeedback] = useState(false)

    // Extract unique categories from saved favorites
    const categories = useMemo(() => {
        const unique = new Set()
        favorites.forEach((b) => {
            if (b.category) unique.add(b.category)
        })
        return ['all', ...Array.from(unique)]
    }, [favorites])

    // Filter and sort books
    const processedBooks = useMemo(() => {
        let result = [...favorites]

        if (selectedCategory !== 'all') {
            result = result.filter(
                (b) => b.category?.toLowerCase() === selectedCategory.toLowerCase()
            )
        }

        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price)
                break
            case 'price-desc':
                result.sort((a, b) => b.price - a.price)
                break
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
                break
            case 'title':
                result.sort((a, b) => a.title.localeCompare(b.title))
                break
            case 'recent':
            default:
                // Keep original order
                break
        }

        return result
    }, [favorites, selectedCategory, sortBy])

    const handleAddAllToCart = () => {
        if (favorites.length === 0) return
        favorites.forEach((book) => {
            addToCart(book, 1)
        })
        setAddedAllFeedback(true)
        setTimeout(() => setAddedAllFeedback(false), 2500)
    }

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all favorite books?')) {
            clearFavorites()
        }
    }

    if (favorites.length === 0) {
        return (
            <div className="favorites-page-container">
                <div className="favorites-content-wrapper">
                    {/* Breadcrumbs */}
                    <nav className="favorites-breadcrumbs" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <span className="crumb-sep">/</span>
                        <Link to="/books">Books</Link>
                        <span className="crumb-sep">/</span>
                        <span className="crumb-active">Favorite Books</span>
                    </nav>

                    {/* Empty State Card */}
                    <div className="empty-favorites-card">
                        <div className="empty-heart-icon-wrapper">
                            <FiHeart className="empty-heart-icon" />
                        </div>
                        <h1 className="empty-favorites-title">Your Wishlist is Empty</h1>
                        <p className="empty-favorites-subtitle">
                            You haven't saved any books yet. As you explore our library, tap the love
                            symbol (<strong>♡</strong>) on any book card to curate your personal collection here.
                        </p>
                        <div className="empty-favorites-actions">
                            <Link to="/books" className="browse-books-btn">
                                <span>Explore Book Catalog</span>
                                <FiArrowRight />
                            </Link>
                            <Link to="/" className="back-home-link">
                                Return to Homepage
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="favorites-page-container">
            <div className="favorites-content-wrapper">
                {/* Breadcrumbs */}
                <nav className="favorites-breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="crumb-sep">/</span>
                    <Link to="/books">Books</Link>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-active">Favorite Books</span>
                </nav>

                {/* Header Banner */}
                <header className="favorites-hero-header">
                    <div>
                        <span className="favorites-eyebrow">YOUR READING WISHLIST</span>
                        <h1 className="favorites-heading">Favorite Books</h1>
                        <p className="favorites-subheading">
                            Stories you've fallen in love with. Keep track of what you wish to read next,
                            or move them directly to your shopping basket.
                        </p>
                    </div>

                    <div className="favorites-hero-stats">
                        <div className="favorites-count-badge">
                            <FiHeart className="filled-heart-badge-icon" />
                            <span>
                                {favorites.length} {favorites.length === 1 ? 'Book' : 'Books'} Saved
                            </span>
                        </div>
                        <div className="favorites-batch-actions">
                            <button
                                type="button"
                                className={`add-all-cart-btn ${addedAllFeedback ? 'success' : ''}`}
                                onClick={handleAddAllToCart}
                                disabled={addedAllFeedback}
                            >
                                {addedAllFeedback ? (
                                    <>
                                        <FiCheck /> Added to Basket!
                                    </>
                                ) : (
                                    <>
                                        <FiShoppingBag /> Add All to Basket
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="clear-favorites-btn"
                                onClick={handleClearAll}
                                title="Clear all saved favorites"
                            >
                                <FiTrash2 /> Clear All
                            </button>
                        </div>
                    </div>
                </header>

                {/* Filter and Sort Toolbar */}
                <div className="favorites-toolbar">
                    <div className="favorites-categories-scroll">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`category-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat === 'all' ? 'All Saved Books' : cat}
                            </button>
                        ))}
                    </div>

                    <div className="favorites-sort-wrapper">
                        <FiSliders className="sort-icon" />
                        <label htmlFor="favorites-sort-select" className="sr-only">
                            Sort favorites
                        </label>
                        <select
                            id="favorites-sort-select"
                            className="favorites-sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="recent">Recently Added</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="title">Title: A to Z</option>
                        </select>
                    </div>
                </div>

                {/* Books Grid */}
                <div className="favorites-grid-wrapper">
                    <AnimatePresence mode="popLayout">
                        <motion.div className="favorites-grid" layout>
                            {processedBooks.map((book) => (
                                <motion.div
                                    key={book.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <BookCard book={book} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Quick Return */}
                <div className="favorites-bottom-nav">
                    <Link to="/books" className="continue-browsing-link">
                        <FiArrowLeft /> Browse More Books in Catalog
                    </Link>
                    <Link to="/cart" className="view-cart-link">
                        <span>View Shopping Basket</span>
                        <FiArrowRight />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Favorites
