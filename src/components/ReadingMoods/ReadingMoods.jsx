import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import './ReadingMoods.css'

const readingMoods = [
    {
        id: 'page-turner',
        mood: 'Need a page-turner',
        tagline: 'Twists, adrenaline & relentless suspense.',
        description: 'Compelling mysteries and psychological thrillers that make you lose track of time late into the night.',
        category: 'Fiction',
        categoryParam: 'Fiction',
        accentColor: '#eb7648',
        size: 'large',
    },
    {
        id: 'inspiring',
        mood: 'Something inspiring',
        tagline: 'Clarity, purpose & life-altering insights.',
        description: 'Memoirs of resilience, mindfulness practices, and habits that encourage you to grow into your highest self.',
        category: 'Self Help',
        categoryParam: 'Self Help',
        accentColor: '#d4a373',
        size: 'large',
    },
    {
        id: 'escape-reality',
        mood: 'Escape reality',
        tagline: 'Mythic lore, high magic & distant worlds.',
        description: 'Step through the portal into immersive sagas and transportive speculative fiction.',
        category: 'Fantasy',
        categoryParam: 'Fantasy',
        accentColor: '#a3b18a',
        size: 'standard',
    },
    {
        id: 'learn-something',
        mood: 'Learn something new',
        tagline: 'Frameworks, mental models & modern ideas.',
        description: 'Concise, evidence-based wisdom from leaders in psychology, business, and human behavior.',
        category: 'Productivity',
        categoryParam: 'Productivity',
        accentColor: '#e07a5f',
        size: 'standard',
    },
    {
        id: 'slow-sunday',
        mood: 'Slow Sunday reading',
        tagline: 'Gentle prose, poetry & quiet contemplation.',
        description: 'Books that reward patient reading, paired with warm coffee and uninterrupted afternoons.',
        category: 'Fiction',
        categoryParam: 'Fiction',
        accentColor: '#81b29a',
        size: 'standard',
    },
]

const ReadingMoods = () => {
    return (
        <section className="reading-moods" aria-label="Reading Moods">
            <div className="reading-moods-container">

                {/* Section Header */}
                <div className="reading-moods-header">
                    <motion.div
                        className="reading-moods-heading-text"
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-eyebrow">WHAT TO READ NEXT</span>
                        <h2>Find Books by Mood</h2>
                        <p>Let how you feel choose what you read. Select a state of mind to discover matched stories.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <Link to="/books" className="view-all-link">
                            View all reading lists
                            <span>→</span>
                        </Link>
                    </motion.div>
                </div>

                {/* Moods Bento Grid */}
                <motion.div
                    className="moods-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.1,
                            },
                        },
                    }}
                >
                    {readingMoods.map((item) => (
                        <motion.div
                            key={item.id}
                            className={`mood-card-wrapper ${item.size === 'large' ? 'mood-card-large' : 'mood-card-standard'}`}
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
                                to={`/books?category=${encodeURIComponent(item.categoryParam)}`}
                                className="mood-card"
                            >
                                <div className="mood-card-content">
                                    <div className="mood-meta">
                                        <span className="mood-category">{item.category}</span>
                                        <span className="mood-indicator" style={{ backgroundColor: item.accentColor }} />
                                    </div>

                                    <div className="mood-main">
                                        <h3 className="mood-title">{item.mood}</h3>
                                        <span className="mood-tagline">{item.tagline}</span>
                                        <p className="mood-description">{item.description}</p>
                                    </div>

                                    <div className="mood-footer">
                                        <span className="mood-cta">Explore matching books</span>
                                        <span className="mood-arrow">→</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    )
}

export default ReadingMoods
