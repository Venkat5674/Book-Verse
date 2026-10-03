import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Home from './components/Home/Home'
import Books from './Books/Books'
import BookDetails from './BookDetails/BookDetails'
import Login from './Login/Login'
import Signup from './Signup/Signup'
import Cart from './Cart/Cart'
import Checkout from './Checkout/Checkout'
import Favorites from './Favorites/Favorites'
import NotFound from './NotFound/NotFound'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/wishlist" element={<Favorites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
