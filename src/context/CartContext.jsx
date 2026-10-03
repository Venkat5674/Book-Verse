import { createContext, useContext, useReducer, useMemo } from 'react'
import { cartReducer, cartInitialState } from '../reducer/cartReducer'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, cartInitialState)

    const addToCart = (book, quantity = 1) => {
        dispatch({ type: 'ADD_TO_CART', payload: { book, quantity } })
    }

    const removeFromCart = (id) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id })
    }

    const increaseQuantity = (id) => {
        dispatch({ type: 'INCREASE_QUANTITY', payload: id })
    }

    const decreaseQuantity = (id) => {
        dispatch({ type: 'DECREASE_QUANTITY', payload: id })
    }

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' })
    }

    // Derived cart totals
    const totalItems = useMemo(() => {
        return state.cartItems.reduce((acc, item) => acc + item.quantity, 0)
    }, [state.cartItems])

    const totalAmount = useMemo(() => {
        return state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    }, [state.cartItems])

    const value = {
        cartItems: state.cartItems,
        totalItems,
        totalAmount,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export default CartContext
