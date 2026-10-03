import BestSellers from '../BestSellers/BestSellers'
import CategorySection from '../CategorySection/CategorySection'
import Hero from '../Hero/Hero'
import NewArrivals from '../NewArrivals/NewArrivals'
import ReadingMoods from '../ReadingMoods/ReadingMoods'
import './Home.css'

const Home = () => {
    return (
        <main className="home">
            <Hero />

            <BestSellers />

            <CategorySection />

            <NewArrivals />

            <ReadingMoods />
        </main>
    )
}

export default Home