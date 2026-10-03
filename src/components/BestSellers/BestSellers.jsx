import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import BookCard from '../BookCard/BookCard'
import localFallbackBooks from '../../data/book'
import './BestSellers.css'

// Default fallback list for immediate render before API responds
const defaultFallbackBestsellers = localFallbackBooks.slice(0, 8)

const BestSellers = () => {
    const [bestsellerBooks, setBestsellerBooks] = useState(defaultFallbackBestsellers)

    // Fetch real bestseller books from Open Library API
    useEffect(() => {
        let ignore = false
        const controller = new AbortController()

        const fetchBestsellersFromAPI = async () => {
            try {
                // Fetch bestsellers from Open Library API
                const response = await fetch(
                    'https://openlibrary.org/subjects/bestseller.json?limit=12',
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch bestsellers: ${response.statusText}`)
                }

                const data = await response.json()
                const works = data.works || []

                if (works.length > 0 && !ignore) {
                    const normalized = works.slice(0, 8).map((item, index) => {
                        const title = item.title || 'Untitled Book'
                        const author = item.authors?.[0]?.name || 'Unknown Author'
                        const coverId = item.cover_id || item.cover_i

                        const coverUrl = coverId
                            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                            : localFallbackBooks[index % localFallbackBooks.length].image

                        // Realistic bookstore pricing and ratings
                        const basePrice = ((index * 39 + 259) % 450) + 299
                        const originalPrice = basePrice + 190 + ((index * 20) % 250)
                        const rating = Number((4.5 + ((index * 3) % 5) * 0.1).toFixed(1))
                        const reviews = 1200 + ((index * 311) % 12000)

                        return {
                            id: item.cover_edition_key || item.key?.replace('/works/', '') || `ol-bestseller-${index}`,
                            title,
                            author,
                            category: item.subject?.[0] || 'Bestseller',
                            price: basePrice,
                            originalPrice,
                            rating,
                            reviews,
                            image: coverUrl,
                            badge: 'Bestseller',
                        }
                    })

                    try {
                        normalized.forEach(b => sessionStorage.setItem(`bookverse_book_${b.id}`, JSON.stringify(b)))
                    } catch {}
                    setBestsellerBooks(normalized)
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Could not fetch bestsellers from Open Library API, using fallback:', err)
                }
            }
        }

        fetchBestsellersFromAPI()

        return () => {
            ignore = true
            controller.abort()
        }
    }, [])

    return (
        <section className="best-sellers">
            <div className="best-sellers-container">

                {/* Section Header */}
                <div className="section-heading">
                    <motion.div
                        className="section-heading-text"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-eyebrow">
                            CURATED FOR YOU
                        </span>

                        <h2>
                            Best Sellers
                        </h2>

                        <p>
                            Stories readers can't stop talking about.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.15,
                        }}
                    >
                        <Link
                            to="/books"
                            className="view-all-link"
                        >
                            View all books
                            <span>→</span>
                        </Link>
                    </motion.div>
                </div>

                {/* Books Grid */}
                <motion.div
                    className="best-sellers-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                        once: true,
                        amount: 0.15,
                    }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.12,
                            },
                        },
                    }}
                >
                    {bestsellerBooks.map(book => (
                        <motion.div
                            key={book.id}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    y: 35,
                                },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.5,
                                        ease: 'easeOut',
                                    },
                                },
                            }}
                        >
                            <BookCard book={book} />
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    )
}

export default BestSellers