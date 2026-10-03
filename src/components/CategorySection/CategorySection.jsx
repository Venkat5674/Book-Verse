import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import './CategorySection.css'

const categories = [
    {
        id: 'fiction',
        name: 'Fiction',
        description: 'Immersive stories, literary worlds & timeless tales.',
        count: '2,400+ titles',
        tag: 'Popular',
        slug: 'Fiction',
    },
    {
        id: 'self-help',
        name: 'Self Help',
        description: 'Mindset, daily habits, personal transformation & focus.',
        count: '1,850+ titles',
        tag: 'Trending',
        slug: 'Self Help',
    },
    {
        id: 'business',
        name: 'Business',
        description: 'Strategy, visionary leadership, finance & innovation.',
        count: '1,200+ titles',
        tag: 'Essential',
        slug: 'Business',
    },
    {
        id: 'fantasy',
        name: 'Fantasy',
        description: 'Mythic folklore, high fantasy & world-building sagas.',
        count: '980+ titles',
        tag: 'Top Rated',
        slug: 'Fantasy',
    },
    {
        id: 'romance',
        name: 'Romance',
        description: 'Heartfelt chemistry, emotional journeys & modern love.',
        count: '1,450+ titles',
        tag: 'Loved',
        slug: 'Romance',
    },
    {
        id: 'young-readers',
        name: 'Young Readers',
        description: 'Inspiring adventures, picture books & teen discoveries.',
        count: '820+ titles',
        tag: 'All Ages',
        slug: 'Young Readers',
    },
]

const CategorySection = () => {
    return (
        <section className="category-section" aria-label="Browse Books by Category">
            <div className="category-container">

                {/* Section Header */}
                <div className="category-header">
                    <motion.div
                        className="category-heading-text"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="category-eyebrow">CURATED SHELVES</span>
                        <h2>Browse by Category</h2>
                        <p>Explore our carefully categorized collections, curated to match your reading appetite.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <Link to="/books" className="category-view-all">
                            Explore all genres
                            <span>→</span>
                        </Link>
                    </motion.div>
                </div>

                {/* Category Grid */}
                <motion.div
                    className="category-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.08,
                            },
                        },
                    }}
                >
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.55, ease: 'easeOut' },
                                },
                            }}
                        >
                            <Link
                                to={`/books?category=${encodeURIComponent(cat.slug)}`}
                                className="category-card"
                            >
                                <div className="category-card-top">
                                    <span className="category-badge">{cat.tag}</span>
                                    <span className="category-count">{cat.count}</span>
                                </div>

                                <div className="category-card-body">
                                    <h3>{cat.name}</h3>
                                    <p>{cat.description}</p>
                                </div>

                                <div className="category-card-footer">
                                    <span className="category-cta">Browse books</span>
                                    <span className="category-arrow">→</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    )
}

export default CategorySection
