import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import './Hero.css'

const floatingBooks = [
    {
        id: 1,
        title: 'Atomic Habits',
        image:
            'https://images-na.ssl-images-amazon.com/images/I/81F90H7hnML.jpg',
        className: 'hero-book hero-book-one',
    },
    {
        id: 2,
        title: 'The Alchemist',
        image:
            'https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg',
        className: 'hero-book hero-book-two',
    },
    {
        id: 3,
        title: 'Ikigai',
        image:
            'https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL.jpg',
        className: 'hero-book hero-book-three',
    },
    {
        id: 4,
        title: 'Deep Work',
        image:
            'https://res.cloudinary.com/l12th5g3/image/upload/v1790935022/51Mt8vD9BIL._SL1500__f2jiez.jpg',
        className: 'hero-book hero-book-four',
    },
]

const Hero = () => {
    return (
        <section className="hero">

            {/* Background Decoration */}
            <div className="hero-glow hero-glow-one"></div>
            <div className="hero-glow hero-glow-two"></div>

            <div className="hero-container">

                {/* LEFT CONTENT */}

                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <motion.span
                        className="hero-eyebrow"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                    >
                        YOUR NEXT GREAT READ
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.8 }}
                    >
                        Stories
                        <br />
                        worth getting
                        <br />
                        <em>lost in.</em>
                    </motion.h1>

                    <motion.p
                        className="hero-description"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.6 }}
                    >
                        Discover books that inspire, challenge and
                        transport you to worlds beyond your own.
                    </motion.p>

                    <motion.div
                        className="hero-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <Link
                            to="/books"
                            className="hero-primary-button"
                        >
                            Explore Books
                            <span>→</span>
                        </Link>

                        <Link
                            to="/books?sort=bestseller"
                            className="hero-secondary-button"
                        >
                            Best Sellers
                        </Link>
                    </motion.div>

                    <motion.div
                        className="hero-meta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                    >
                        <span>10,000+ books</span>
                        <span className="hero-meta-dot">•</span>
                        <span>Curated for readers</span>
                    </motion.div>
                </motion.div>

                {/* RIGHT BOOK VISUAL */}

                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        delay: 0.25,
                        duration: 1,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >

                    {/* Decorative circle */}

                    <div className="hero-circle"></div>

                    {/* Books */}

                    {floatingBooks.map((book, index) => (
                        <motion.div
                            key={book.id}
                            className={book.className}
                            initial={{
                                opacity: 0,
                                scale: 0.7,
                                y: 30,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.5 + index * 0.12,
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            whileHover={{
                                scale: 1.05,
                                rotate: 0,
                                y: -10,
                            }}
                        >
                            <img
                                src={book.image}
                                alt={book.title}
                            />
                        </motion.div>
                    ))}

                </motion.div>

            </div>

            {/* Scroll indicator */}

            <motion.div
                className="hero-scroll"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <span>Scroll to explore</span>

                <motion.span
                    animate={{ y: [0, 6, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    ↓
                </motion.span>
            </motion.div>

        </section>
    )
}

export default Hero