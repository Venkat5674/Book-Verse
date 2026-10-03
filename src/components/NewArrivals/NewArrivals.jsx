import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import BookCard from '../BookCard/BookCard'
import localFallbackBooks from '../../data/book'
import './NewArrivals.css'

// Default fallback list for immediate render before API responds
const defaultFallbackArrivals = localFallbackBooks.filter(b => b.badge === 'New Release').length > 0
    ? localFallbackBooks.filter(b => b.badge === 'New Release')
    : localFallbackBooks.slice(4).concat(localFallbackBooks.slice(0, 4))

const NewArrivals = () => {
    const scrollRef = useRef(null)
    const [arrivalBooks, setArrivalBooks] = useState(defaultFallbackArrivals)

    // Fetch real books from Open Library API
    useEffect(() => {
        let ignore = false
        const controller = new AbortController()

        const fetchArrivalsFromAPI = async () => {
            try {
                // Fetch new & contemporary titles from Open Library API
                const response = await fetch(
                    'https://openlibrary.org/subjects/contemporary_fiction.json?limit=14',
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch arrivals: ${response.statusText}`)
                }

                const data = await response.json()
                const works = data.works || []

                if (works.length > 0 && !ignore) {
                    const normalized = works.map((item, index) => {
                        const title = item.title || 'Untitled Book'
                        const author = item.authors?.[0]?.name || 'Unknown Author'
                        const coverId = item.cover_id || item.cover_i

                        const coverUrl = coverId
                            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                            : localFallbackBooks[index % localFallbackBooks.length].image

                        // Dynamic bookstore pricing
                        const basePrice = ((index * 43 + 289) % 400) + 299
                        const originalPrice = basePrice + 160 + ((index * 25) % 200)
                        const rating = Number((4.2 + ((index * 2) % 8) * 0.1).toFixed(1))
                        const reviews = 240 + ((index * 179) % 3600)

                        return {
                            id: item.cover_edition_key || item.key?.replace('/works/', '') || `ol-arrival-${index}`,
                            title,
                            author,
                            category: item.subject?.[0] || 'New Release',
                            price: basePrice,
                            originalPrice,
                            rating,
                            reviews,
                            image: coverUrl,
                            badge: 'New Release',
                        }
                    })

                    try {
                        normalized.forEach(b => sessionStorage.setItem(`bookverse_book_${b.id}`, JSON.stringify(b)))
                    } catch {}
                    setArrivalBooks(normalized)
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Could not fetch new arrivals from Open Library, using local fallback:', err)
                }
            }
        }

        fetchArrivalsFromAPI()

        return () => {
            ignore = true
            controller.abort()
        }
    }, [])

    const handleScroll = (direction) => {
        if (!scrollRef.current) return
        const scrollAmount = 340
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        })
    }

    return (
        <section className="new-arrivals" aria-label="New Arrivals Section">
            <div className="new-arrivals-container">

                {/* Section Header */}
                <div className="new-arrivals-header">
                    <motion.div
                        className="new-arrivals-heading-text"
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-eyebrow">JUST LANDED</span>
                        <h2>New Arrivals</h2>
                        <p>Fresh stories, new perspectives, and newly published gems added to our shelves this week.</p>
                    </motion.div>

                    <div className="new-arrivals-controls">
                        <Link to="/books?sort=newest" className="view-all-link">
                            View all new arrivals
                            <span>→</span>
                        </Link>

                        <div className="carousel-arrows" aria-label="Carousel navigation">
                            <button
                                type="button"
                                className="arrow-btn"
                                onClick={() => handleScroll('left')}
                                aria-label="Scroll left"
                            >
                                <FiArrowLeft />
                            </button>
                            <button
                                type="button"
                                className="arrow-btn"
                                onClick={() => handleScroll('right')}
                                aria-label="Scroll right"
                            >
                                <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scroll Track */}
                <motion.div
                    className="new-arrivals-track"
                    ref={scrollRef}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                >
                    {arrivalBooks.map((book) => (
                        <div key={book.id} className="new-arrival-item">
                            <BookCard book={book} />
                        </div>
                    ))}
                </motion.div>

            </div>
        </section>
    )
}

export default NewArrivals
