import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
    FiCheck,
    FiShoppingBag,
    FiHeart,
    FiTruck,
    FiShield,
    FiRefreshCw,
    FiArrowLeft,
    FiMinus,
    FiPlus,
    FiBookOpen,
    FiAward,
} from 'react-icons/fi'
import BookCard from '../components/BookCard/BookCard'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import localFallbackBooks from '../data/book'
import './BookDetails.css'

// Curated rich descriptions and author bios for popular titles
const BOOK_ENRICHMENTS = {
    '1': {
        tagline: 'Tiny Changes, Remarkable Results',
        description:
            'No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.\n\nIf you\'re having trouble changing your habits, the problem isn\'t you. The problem is your system. Bad habits repeat themselves again and again not because you don\'t want to change, but because you have the wrong system for change. You do not rise to the level of your goals. You fall to the level of your systems. Here, you\'ll get a proven plan that can take you to new heights.',
        authorBio:
            'James Clear is a writer and speaker focused on habits, decision making, and continuous improvement. His work has appeared in the New York Times, Entrepreneur, Time, and on CBS This Morning. His website receives millions of visitors each month, and hundreds of thousands subscribe to his popular 3-2-1 email newsletter.',
        highlights: [
            'Learn how to make time for new habits even when life gets crazy',
            'Overcome a lack of motivation and willpower through environment design',
            'Design your environment to make success easier and failure nearly impossible',
            'Get back on track when you fall off course with the 2-minute rule',
        ],
        pages: 320,
        publisher: 'Avery / Penguin Random House',
        language: 'English',
        isbn13: '978-0735211292',
        publicationYear: 2018,
    },
    '2': {
        tagline: 'A Fable About Following Your Dream',
        description:
            'Paulo Coelho\'s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined.\n\nSantiago\'s journey teaches us about the essential wisdom of listening to our hearts, of recognizing opportunity and learning to read the omens strewn along life\'s path, and, most importantly, to follow our dreams.',
        authorBio:
            'Paulo Coelho, born in Rio de Janeiro in 1947, is one of the most widely read and influential authors in the world. His books have been translated into 88 languages and published in more than 170 countries.',
        highlights: [
            'Over 150 million copies sold worldwide in 80+ languages',
            'Timeless wisdom on destiny, personal legend, and inner growth',
            'An inspiring spiritual journey cherished by generations',
        ],
        pages: 208,
        publisher: 'HarperOne',
        language: 'English',
        isbn13: '978-0062315007',
        publicationYear: 1988,
    },
    '3': {
        tagline: 'The Japanese Secret to a Long and Happy Life',
        description:
            'According to the Japanese, everyone has an ikigai—a reason for living. And according to the residents of the Japanese village with the world\'s longest-living people, finding it is the key to a happier and longer life.\n\nHaving a strong sense of ikigai—the place where passion, mission, vocation, and profession intersect—means that each day is infused with meaning. It’s why we get up in the morning. It’s also why many Japanese people never really retire.',
        authorBio:
            'Héctor García is a citizen of Japan who has lived in Tokyo since 2004. Francesc Miralles is an award-winning author who has written a number of bestselling books and works as a journalist.',
        highlights: [
            'Discover the intersect of passion, vocation, mission, and profession',
            'Longevity secrets from the centenarians of Okinawa',
            'Practical exercises to uncover your daily purpose',
        ],
        pages: 208,
        publisher: 'Penguin Life',
        language: 'English',
        isbn13: '978-0143130727',
        publicationYear: 2016,
    },
    '4': {
        tagline: 'Rules for Focused Success in a Distracted World',
        description:
            'Deep work is the ability to focus without distraction on a cognitively demanding task. It\'s a skill that allows you to quickly master complicated information and produce better results in less time.\n\nCal Newport explains why cultivating deep work is the superpower of the knowledge economy, providing rigorous guidelines to eliminate mental clutter and transform your output.',
        authorBio:
            'Cal Newport, Ph.D., is a professor of computer science at Georgetown University and the bestselling author of seven books, including Digital Minimalism and So Good They Can\'t Ignore You.',
        highlights: [
            'Master high-velocity cognitive focus without modern distractions',
            'Four actionable rules to structure deep vs. shallow work',
            'Actionable strategies practiced by high-achieving innovators',
        ],
        pages: 304,
        publisher: 'Grand Central Publishing',
        language: 'English',
        isbn13: '978-1455586691',
        publicationYear: 2016,
    },
    '5': {
        tagline: 'Timeless Lessons on Wealth, Greed, and Happiness',
        description:
            'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people.\n\nMoney—investing, personal finance, and business decisions—is typically taught as a math-based field, where data and formulas tell us exactly what to do. But in the real world people don\'t make financial decisions on a spreadsheet. They make them at the dinner table, or in a meeting room, where personal history, ego, and strange incentives are scrambled together.',
        authorBio:
            'Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal. He is a two-time winner of the Best in Business Award from the Society of American Business Editors and Writers.',
        highlights: [
            '19 short stories exploring the strange ways people think about money',
            'Understand the emotional and psychological underpinnings of wealth',
            'Insights on patience, compounding, and financial peace of mind',
        ],
        pages: 256,
        publisher: 'Harriman House',
        language: 'English',
        isbn13: '978-0857197689',
        publicationYear: 2020,
    },
}

// Sample authentic reader reviews
const REVIEWS_DATA = [
    {
        id: 'rev-1',
        author: 'Arunav Sharma',
        avatar: 'A',
        rating: 5,
        date: 'September 18, 2026',
        title: 'Life changing and extraordinarily well structured!',
        content:
            'One of the best purchases I have made this year. The book arrived in pristine condition from BookVerse, packed securely with a nice bookmark. The concepts inside are applicable from day one.',
        helpfulCount: 42,
    },
    {
        id: 'rev-2',
        author: 'Priya Mukherjee',
        avatar: 'P',
        rating: 5,
        date: 'August 29, 2026',
        title: 'Must-read for every bibliophile',
        content:
            'Beautiful editorial quality, smooth paper, and the typography is very easy on the eyes. The insights in this volume are deep and thought-provoking. Highly recommended!',
        helpfulCount: 28,
    },
    {
        id: 'rev-3',
        author: 'Rohan Mehra',
        avatar: 'R',
        rating: 4,
        date: 'August 10, 2026',
        title: 'Engaging from the first page',
        content:
            'Delivered on time in 2 days. The narrative flow is compelling. A great addition to my home library bookshelf.',
        helpfulCount: 15,
    },
]

const RELATED_SUBJECT_MAP = {
    'Fiction': 'fiction',
    'Non-Fiction': 'nonfiction',
    'Self-Help': 'self-help',
    'Business': 'business',
    'Philosophy': 'philosophy',
    'Psychology': 'psychology',
    'Productivity': 'productivity',
    'Science': 'science',
    'Biography': 'biography',
    'History': 'history',
    'Mystery': 'mystery',
    'Fantasy': 'fantasy',
    'Literature': 'literature',
}

const BookDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { addToCart } = useCart()

    const [book, setBook] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [relatedBooks, setRelatedBooks] = useState(() =>
        localFallbackBooks.filter(b => String(b.id) !== String(id)).slice(0, 4)
    )
    const [isRelatedLoading, setIsRelatedLoading] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('synopsis')
    const [selectedFormat, setSelectedFormat] = useState('Paperback')
    const { isFavorite, toggleFavorite } = useFavorites()
    const isWishlisted = book ? isFavorite(book.id) : false
    const [isAddedFeedback, setIsAddedFeedback] = useState(false)
    const [toastMessage, setToastMessage] = useState(null)

    // Adjust state during render when id changes
    const [prevId, setPrevId] = useState(id)
    if (prevId !== id) {
        setPrevId(id)
        setQuantity(1)
        setIsAddedFeedback(false)
        setIsLoading(true)
    }

    // Smoothly scroll to top on book change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [id])

    // Fetch or locate book by ID (local book, location.state, cache, or Open Library)
    useEffect(() => {
        let ignore = false

        const resolveBook = async () => {
            // 0. Check router location.state or sessionStorage cache first (instant, 100% accurate!)
            let cached = null
            try {
                const stored = sessionStorage.getItem(`bookverse_book_${id}`)
                if (stored) {
                    cached = JSON.parse(stored)
                }
            } catch {}

            const sourceBook = location.state?.book || cached

            if (sourceBook && (String(sourceBook.id) === String(id) || !sourceBook.id)) {
                const enrichment = BOOK_ENRICHMENTS[String(id)] || {}
                const resolved = {
                    ...sourceBook,
                    id,
                    tagline: enrichment.tagline || (sourceBook.badge ? `${sourceBook.badge} • Acclaimed Edition` : 'Curated Masterpiece'),
                    description: sourceBook.description || enrichment.description || `An acclaimed work by ${sourceBook.author}, exploring deep themes of ${sourceBook.category || 'Literature'} with compelling narrative mastery and timeless insight. Loved by readers worldwide.`,
                    authorBio: sourceBook.authorBio || enrichment.authorBio || `${sourceBook.author} is an esteemed author renowned for captivating storytelling, insightful research, and acclaimed international publications.`,
                    highlights: sourceBook.highlights || enrichment.highlights || [
                        `Acclaimed international title in ${sourceBook.category || 'Literature'}`,
                        'Thoughtful, engaging writing style suitable for all readers',
                        'Delivers practical wisdom and unforgettable storytelling',
                        'Certified authentic edition with archival-quality print',
                    ],
                    pages: sourceBook.pages || enrichment.pages || 320,
                    publisher: sourceBook.publisher || enrichment.publisher || 'Vintage Books International',
                    language: sourceBook.language || enrichment.language || 'English',
                    isbn13: sourceBook.isbn13 || enrichment.isbn13 || `978-81${String(id).replace(/\D/g, '').padEnd(8, '0').slice(0, 8)}`,
                    publicationYear: sourceBook.firstPublishYear || sourceBook.publicationYear || enrichment.publicationYear || 2022,
                }
                if (!ignore) {
                    setBook(resolved)
                    setIsLoading(false)
                }
                return
            }

            // 1. Check local static books first
            const localMatch = localFallbackBooks.find(b => String(b.id) === String(id))
            if (localMatch) {
                const enrichment = BOOK_ENRICHMENTS[String(id)] || {}
                const resolved = {
                    ...localMatch,
                    tagline: enrichment.tagline || 'Editorial Choice & Bestseller',
                    description: enrichment.description || `An acclaimed work by ${localMatch.author}, exploring deep themes with compelling narrative mastery and timeless insight. Loved by readers worldwide.`,
                    authorBio: enrichment.authorBio || `${localMatch.author} is an esteemed author renowned for captivating storytelling, insightful research, and acclaimed international publications.`,
                    highlights: enrichment.highlights || [
                        'Critically acclaimed international bestseller',
                        'Thoughtful, engaging writing style suitable for all readers',
                        'Delivers practical wisdom and unforgettable storytelling',
                    ],
                    pages: enrichment.pages || 280,
                    publisher: enrichment.publisher || 'Vintage Books',
                    language: enrichment.language || 'English',
                    isbn13: enrichment.isbn13 || `978-81${String(id).padStart(8, '0')}`,
                    publicationYear: enrichment.publicationYear || 2021,
                }
                if (!ignore) {
                    setBook(resolved)
                    setIsLoading(false)
                }
                return
            }

            // 2. Fetch from Open Library if ID is an Open Library Work/Book key
            try {
                const isWork = id.startsWith('OL') || id.includes('W')
                const url = isWork
                    ? `https://openlibrary.org/works/${id}.json`
                    : `https://openlibrary.org/books/${id}.json`

                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 4000)

                const res = await fetch(url, { signal: controller.signal })
                clearTimeout(timeoutId)

                if (res.ok) {
                    const data = await res.json()
                    const title = data.title || 'Featured Literary Work'
                    let description = 'A remarkable literary piece curated from the Open Library international catalog.'
                    if (data.description) {
                        description = typeof data.description === 'string'
                            ? data.description
                            : (data.description.value || description)
                    }

                    // Cover image
                    const coverId = data.covers?.[0]
                    const coverUrl = coverId
                        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                        : localFallbackBooks[0].image

                    const resolved = {
                        id,
                        title,
                        author: 'Open Library Author',
                        category: data.subjects?.[0] || 'Fiction',
                        price: 399,
                        originalPrice: 649,
                        rating: 4.7,
                        reviews: 3240,
                        image: coverUrl,
                        badge: 'Open Library',
                        tagline: 'World Heritage Literature',
                        description,
                        authorBio: 'Esteemed author represented in the public Open Library international archives.',
                        highlights: [
                            'Indexed in the comprehensive Open Library digital collection',
                            'Celebrated classic and intellectual milestone',
                            'Available through BookVerse certified distribution',
                        ],
                        pages: data.number_of_pages || 310,
                        publisher: data.publishers?.[0] || 'Open Heritage Editions',
                        language: 'English',
                        isbn13: '978-0198534532',
                        publicationYear: data.first_publish_date || 2019,
                    }

                    if (!ignore) {
                        setBook(resolved)
                        setIsLoading(false)
                    }
                    return
                }
            } catch (err) {
                console.warn('Could not fetch book details from Open Library, using diversified fallback', err)
            }

            // 3. Fallback graceful resolution: Pick a diversified book based on hash(id) instead of ALWAYS localFallbackBooks[0]!
            if (!ignore) {
                let numericHash = 0
                for (let i = 0; i < id.length; i++) {
                    numericHash = (numericHash * 31 + id.charCodeAt(i)) & 0xffffffff
                }
                const fallbackIndex = Math.abs(numericHash) % localFallbackBooks.length
                const fallback = localFallbackBooks[fallbackIndex]

                setBook({
                    ...fallback,
                    id,
                    tagline: 'Staff Recommendation',
                    description: `An extraordinary title by ${fallback.author}, available in our curated collection.`,
                    authorBio: `${fallback.author} is a beloved storyteller with readers spanning the globe.`,
                    highlights: ['Bestselling title with raving editorial reviews', 'Fast shipping with premium packaging'],
                    pages: 320,
                    publisher: 'Penguin Classics',
                    language: 'English',
                    isbn13: `978-014${String(Math.abs(numericHash)).slice(0, 7)}`,
                    publicationYear: 2022,
                })
                setIsLoading(false)
            }
        }

        resolveBook()

        return () => {
            ignore = true
        }
    }, [id, location.state])

    // Price adjustment according to format
    const formatPriceAdjust = {
        'Paperback': 0,
        'Hardcover': 200,
        'eBook': -100,
    }

    const currentPrice = book ? Math.max(99, book.price + (formatPriceAdjust[selectedFormat] || 0)) : 0
    const originalPrice = book ? book.originalPrice + (formatPriceAdjust[selectedFormat] || 0) : 0
    const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0

    // Handle Quantity
    const handleDecrease = () => setQuantity(prev => Math.max(1, prev - 1))
    const handleIncrease = () => setQuantity(prev => Math.min(20, prev + 1))

    // Handle Add To Cart
    const handleAddToCart = () => {
        if (!book) return
        const cartItem = {
            ...book,
            price: currentPrice,
            format: selectedFormat,
        }
        addToCart(cartItem, quantity)
        setIsAddedFeedback(true)
        setToastMessage(`Added ${quantity} × "${book.title}" (${selectedFormat}) to your cart!`)

        setTimeout(() => {
            setIsAddedFeedback(false)
        }, 2200)

        setTimeout(() => {
            setToastMessage(null)
        }, 3500)
    }

    // Handle Buy Now
    const handleBuyNow = () => {
        handleAddToCart()
        navigate('/cart')
    }

    // Fetch related books dynamically from Open Library API based on current book's category/theme
    useEffect(() => {
        let ignore = false
        const controller = new AbortController()

        const fetchRelatedBooks = async () => {
            setIsRelatedLoading(true)
            try {
                const subject = (book?.category && RELATED_SUBJECT_MAP[book.category]) ||
                    (book?.category ? book.category.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'bestseller')

                const response = await fetch(
                    `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=16`,
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch related books: ${response.statusText}`)
                }

                const data = await response.json()
                const works = data.works || []

                if (works.length > 0 && !ignore) {
                    const fallbackSlice = localFallbackBooks.filter(b => String(b.id) !== String(id))

                    const filteredWorks = works.filter((w) => {
                        const workKey = w.cover_edition_key || w.key?.replace('/works/', '')
                        return (
                            workKey !== id &&
                            w.title?.toLowerCase() !== book?.title?.toLowerCase()
                        )
                    })

                    const normalized = filteredWorks.slice(0, 4).map((item, index) => {
                        const title = item.title || 'Untitled Book'
                        const author = item.authors?.[0]?.name || 'Unknown Author'
                        const coverId = item.cover_id || item.cover_i

                        const coverUrl = coverId
                            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                            : fallbackSlice[index % fallbackSlice.length]?.image || localFallbackBooks[0].image

                        const basePrice = ((index * 41 + 279) % 450) + 249
                        const originalPrice = basePrice + 160 + ((index * 20) % 200)
                        const rating = Number((4.3 + ((index * 2) % 7) * 0.1).toFixed(1))
                        const reviews = 280 + ((index * 153) % 4100)

                        const badges = ['Recommended', 'Companion Read', 'Popular Choice', 'Trending', 'Staff Pick']
                        const badge = badges[index % badges.length]

                        return {
                            id: item.cover_edition_key || item.key?.replace('/works/', '') || `ol-rel-${index}`,
                            title,
                            author,
                            category: book?.category || item.subject?.[0] || 'Curated',
                            price: basePrice,
                            originalPrice,
                            rating,
                            reviews,
                            image: coverUrl,
                            badge,
                        }
                    })

                    // Ensure at least 4 items by padding from local fallback if necessary
                    let finalRelated = [...normalized]
                    if (finalRelated.length < 4) {
                        fallbackSlice.forEach((fb) => {
                            if (finalRelated.length < 4 && !finalRelated.some(r => String(r.id) === String(fb.id))) {
                                finalRelated.push(fb)
                            }
                        })
                    }

                    setRelatedBooks(finalRelated.slice(0, 4))
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Could not fetch related books from Open Library, using local fallback:', err)
                    if (!ignore) {
                        setRelatedBooks(
                            localFallbackBooks.filter(b => String(b.id) !== String(id)).slice(0, 4)
                        )
                    }
                }
            } finally {
                if (!ignore) {
                    setIsRelatedLoading(false)
                }
            }
        }

        fetchRelatedBooks()

        return () => {
            ignore = true
            controller.abort()
        }
    }, [id, book?.category, book?.title])

    if (isLoading) {
        return (
            <div className="book-details-loading-container">
                <div className="book-details-skeleton-grid">
                    <div className="skeleton-cover-box shimmer" />
                    <div className="skeleton-info-col">
                        <div className="skeleton-line shimmer" style={{ width: '30%', height: '20px' }} />
                        <div className="skeleton-line shimmer" style={{ width: '70%', height: '40px' }} />
                        <div className="skeleton-line shimmer" style={{ width: '40%', height: '24px' }} />
                        <div className="skeleton-line shimmer" style={{ width: '50%', height: '32px' }} />
                        <div className="skeleton-line shimmer" style={{ width: '100%', height: '100px', marginTop: '20px' }} />
                    </div>
                </div>
            </div>
        )
    }

    if (!book) {
        return (
            <div className="book-details-not-found">
                <h2>Book Not Found</h2>
                <p>The book you are looking for does not exist or may have been removed.</p>
                <Link to="/books" className="back-to-catalog-btn">
                    <FiArrowLeft /> Back to Books Catalog
                </Link>
            </div>
        )
    }

    return (
        <div className="book-details-page">
            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        className="book-details-toast"
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        <span className="toast-icon">✓</span>
                        <span className="toast-text">{toastMessage}</span>
                        <Link to="/cart" className="toast-cart-link">View Cart →</Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="book-details-container">
                {/* Breadcrumbs Navigation */}
                <nav className="book-breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to="/books">Books</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link to={`/books?category=${encodeURIComponent(book.category)}`}>
                        {book.category}
                    </Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active" title={book.title}>
                        {book.title}
                    </span>
                </nav>

                {/* Main Book Hero Showcase */}
                <section className="book-hero-section">
                    {/* Left: Book Cover Image & Perks */}
                    <div className="book-cover-showcase">
                        <div className="book-cover-frame">
                            {book.badge && (
                                <span className="book-hero-badge">
                                    <FiAward /> {book.badge}
                                </span>
                            )}
                            <img
                                src={book.image}
                                alt={book.title}
                                className="book-hero-image"
                                loading="eager"
                            />
                            <button
                                type="button"
                                className={`book-hero-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                                onClick={() => book && toggleFavorite(book)}
                                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <FiHeart className={isWishlisted ? 'filled' : ''} />
                            </button>
                        </div>

                        {/* Store Trust Badges */}
                        <div className="book-trust-badges">
                            <div className="trust-item">
                                <FiTruck className="trust-icon" />
                                <div>
                                    <strong>Free Express Delivery</strong>
                                    <span>On orders above ₹499</span>
                                </div>
                            </div>
                            <div className="trust-item">
                                <FiShield className="trust-icon" />
                                <div>
                                    <strong>100% Genuine Copy</strong>
                                    <span>Direct from verified publishers</span>
                                </div>
                            </div>
                            <div className="trust-item">
                                <FiRefreshCw className="trust-icon" />
                                <div>
                                    <strong>7-Day Easy Returns</strong>
                                    <span>Hassle-free replacement</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Book Details & Actions */}
                    <div className="book-info-showcase">
                        <div className="book-meta-top">
                            <span className="book-category-tag">{book.category}</span>
                            <span className="book-stock-pill in-stock">
                                <span className="stock-dot" /> In Stock & Ready to Ship
                            </span>
                        </div>

                        <h1 className="book-details-title">{book.title}</h1>
                        <p className="book-details-tagline">{book.tagline}</p>

                        <div className="book-author-row">
                            <span>By</span>
                            <span className="book-author-name">{book.author}</span>
                            <span className="dot-divider">•</span>
                            <span className="book-published-year">Published {book.publicationYear}</span>
                        </div>

                        {/* Ratings & Reviews bar */}
                        <div className="book-ratings-summary">
                            <div className="star-pill">
                                <span className="star-icon">★</span>
                                <span className="rating-value">{book.rating}</span>
                            </div>
                            <span className="rating-divider">|</span>
                            <span className="reviews-count-text">
                                {book.reviews.toLocaleString()} Verified Customer Ratings
                            </span>
                        </div>

                        {/* Price Display */}
                        <div className="book-pricing-box">
                            <div className="price-row">
                                <span className="book-current-price">₹{currentPrice}</span>
                                <span className="book-original-price">₹{originalPrice}</span>
                                <span className="book-discount-tag">{discountPercent}% OFF</span>
                            </div>
                            <span className="tax-inclusive-label">Inclusive of all taxes • Instant Dispatch</span>
                        </div>

                        {/* Format Selector */}
                        <div className="book-format-selector">
                            <label className="format-label">Select Edition / Format:</label>
                            <div className="format-options">
                                {[
                                    { name: 'Paperback', extra: '+₹0' },
                                    { name: 'Hardcover', extra: '+₹200' },
                                    { name: 'eBook', extra: '-₹100' },
                                ].map(format => (
                                    <button
                                        key={format.name}
                                        type="button"
                                        className={`format-btn ${selectedFormat === format.name ? 'active' : ''}`}
                                        onClick={() => setSelectedFormat(format.name)}
                                    >
                                        <span className="format-name">{format.name}</span>
                                        <span className="format-price-diff">{format.extra}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity and Add to Cart Section */}
                        <div className="book-cta-section">
                            <div className="quantity-wrapper">
                                <label className="quantity-label">Quantity</label>
                                <div className="quantity-selector">
                                    <button
                                        type="button"
                                        className="qty-btn"
                                        onClick={handleDecrease}
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <FiMinus />
                                    </button>
                                    <span className="qty-value">{quantity}</span>
                                    <button
                                        type="button"
                                        className="qty-btn"
                                        onClick={handleIncrease}
                                        disabled={quantity >= 20}
                                        aria-label="Increase quantity"
                                    >
                                        <FiPlus />
                                    </button>
                                </div>
                            </div>

                            <div className="action-buttons-group">
                                <button
                                    type="button"
                                    className={`book-add-cart-btn ${isAddedFeedback ? 'added' : ''}`}
                                    onClick={handleAddToCart}
                                    id="add-to-cart-button"
                                >
                                    {isAddedFeedback ? (
                                        <>
                                            <FiCheck className="btn-icon" /> Added to Cart!
                                        </>
                                    ) : (
                                        <>
                                            <FiShoppingBag className="btn-icon" /> Add to Cart — ₹{currentPrice * quantity}
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="book-buy-now-btn"
                                    onClick={handleBuyNow}
                                    id="buy-now-button"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>

                        {/* Quick Specs Grid */}
                        <div className="book-quick-specs">
                            <div className="spec-card">
                                <span className="spec-label">Pages</span>
                                <span className="spec-val">{book.pages}</span>
                            </div>
                            <div className="spec-card">
                                <span className="spec-label">Language</span>
                                <span className="spec-val">{book.language}</span>
                            </div>
                            <div className="spec-card">
                                <span className="spec-label">Publisher</span>
                                <span className="spec-val">{book.publisher.split('/')[0]}</span>
                            </div>
                            <div className="spec-card">
                                <span className="spec-label">Format</span>
                                <span className="spec-val">{selectedFormat}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Editorial Details & Content Tabs */}
                <section className="book-editorial-tabs-section">
                    <div className="tabs-header" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'synopsis'}
                            className={`tab-btn ${activeTab === 'synopsis' ? 'active' : ''}`}
                            onClick={() => setActiveTab('synopsis')}
                        >
                            <FiBookOpen className="tab-icon" /> Synopsis & Overview
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'author'}
                            className={`tab-btn ${activeTab === 'author' ? 'active' : ''}`}
                            onClick={() => setActiveTab('author')}
                        >
                            About the Author
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'specs'}
                            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specs')}
                        >
                            Product Specifications
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'reviews'}
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Customer Reviews ({book.reviews.toLocaleString()})
                        </button>
                    </div>

                    <div className="tab-content-panel">
                        {/* Tab 1: Synopsis */}
                        {activeTab === 'synopsis' && (
                            <motion.div
                                className="tab-pane synopsis-pane"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="synopsis-paragraphs">
                                    {book.description.split('\n\n').map((para, idx) => (
                                        <p key={idx}>{para}</p>
                                    ))}
                                </div>

                                {book.highlights && book.highlights.length > 0 && (
                                    <div className="synopsis-highlights">
                                        <h3>Key Highlights & Takeaways</h3>
                                        <ul>
                                            {book.highlights.map((item, idx) => (
                                                <li key={idx}>
                                                    <span className="highlight-bullet">✦</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Tab 2: About Author */}
                        {activeTab === 'author' && (
                            <motion.div
                                className="tab-pane author-pane"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="author-card">
                                    <div className="author-avatar">
                                        {book.author.charAt(0)}
                                    </div>
                                    <div className="author-content">
                                        <h3>{book.author}</h3>
                                        <p className="author-subtitle">Author & Thought Leader</p>
                                        <p className="author-bio-text">{book.authorBio}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Tab 3: Specifications */}
                        {activeTab === 'specs' && (
                            <motion.div
                                className="tab-pane specs-pane"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <table className="specs-table">
                                    <tbody>
                                        <tr>
                                            <th>Title</th>
                                            <td>{book.title}</td>
                                        </tr>
                                        <tr>
                                            <th>Author</th>
                                            <td>{book.author}</td>
                                        </tr>
                                        <tr>
                                            <th>Publisher</th>
                                            <td>{book.publisher}</td>
                                        </tr>
                                        <tr>
                                            <th>Publication Date</th>
                                            <td>{book.publicationYear}</td>
                                        </tr>
                                        <tr>
                                            <th>Edition Format</th>
                                            <td>{selectedFormat}</td>
                                        </tr>
                                        <tr>
                                            <th>Print Length</th>
                                            <td>{book.pages} pages</td>
                                        </tr>
                                        <tr>
                                            <th>Language</th>
                                            <td>{book.language}</td>
                                        </tr>
                                        <tr>
                                            <th>ISBN-13</th>
                                            <td>{book.isbn13}</td>
                                        </tr>
                                        <tr>
                                            <th>Item Unique ID</th>
                                            <td><code>{book.id}</code></td>
                                        </tr>
                                        <tr>
                                            <th>Dimensions</th>
                                            <td>13.8 x 2.4 x 21.6 cm</td>
                                        </tr>
                                        <tr>
                                            <th>Weight</th>
                                            <td>380 grams</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {/* Tab 4: Reviews */}
                        {activeTab === 'reviews' && (
                            <motion.div
                                className="tab-pane reviews-pane"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="reviews-summary-bar">
                                    <div className="rating-big-score">
                                        <span className="big-number">{book.rating}</span>
                                        <div className="stars-row">
                                            {'★★★★★'.split('').map((s, i) => (
                                                <span key={i} className="star-gold">{s}</span>
                                            ))}
                                        </div>
                                        <span className="score-subtitle">Based on {book.reviews.toLocaleString()} global ratings</span>
                                    </div>

                                    <div className="rating-bars-breakdown">
                                        {[
                                            { star: '5 Star', pct: '78%' },
                                            { star: '4 Star', pct: '16%' },
                                            { star: '3 Star', pct: '4%' },
                                            { star: '2 Star', pct: '1%' },
                                            { star: '1 Star', pct: '1%' },
                                        ].map(row => (
                                            <div key={row.star} className="rating-bar-row">
                                                <span className="bar-star-label">{row.star}</span>
                                                <div className="bar-track">
                                                    <div className="bar-fill" style={{ width: row.pct }} />
                                                </div>
                                                <span className="bar-pct-label">{row.pct}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="customer-reviews-list">
                                    <h3>Verified Customer Impressions</h3>
                                    {REVIEWS_DATA.map(review => (
                                        <div key={review.id} className="single-review-card">
                                            <div className="review-header">
                                                <div className="review-user-avatar">{review.avatar}</div>
                                                <div className="review-user-info">
                                                    <span className="review-user-name">{review.author}</span>
                                                    <span className="verified-badge">✓ Verified Purchaser</span>
                                                </div>
                                                <span className="review-date">{review.date}</span>
                                            </div>
                                            <div className="review-stars">
                                                {'★'.repeat(review.rating)}
                                            </div>
                                            <h4 className="review-title">{review.title}</h4>
                                            <p className="review-body">{review.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* You May Also Like / Related Books */}
                <section className="related-books-section">
                    <div className="related-books-header">
                        <span className="section-eyebrow">Curated Recommendations</span>
                        <h2 className="section-heading">Readers Also Explored</h2>
                        <p className="section-subtitle">
                            Handpicked companion titles matching the themes of <em>{book.title}</em>
                        </p>
                    </div>

                    <div className="related-books-grid">
                        {relatedBooks.map(item => (
                            <BookCard key={item.id} book={item} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default BookDetails
