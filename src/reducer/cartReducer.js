// Cart Reducer handling e-commerce cart actions

export const cartInitialState = {
    cartItems: (() => {
        try {
            const saved = localStorage.getItem('bookverse_cart')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })(),
}

export const cartReducer = (state, action) => {
    let updatedCart

    switch (action.type) {
        case 'ADD_TO_CART': {
            const { book, quantity = 1 } = action.payload
            const existingIndex = state.cartItems.findIndex(item => String(item.id) === String(book.id))

            if (existingIndex > -1) {
                // If book already in cart, increment quantity
                updatedCart = state.cartItems.map((item, index) =>
                    index === existingIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            } else {
                // Add new book to cart
                const newItem = {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    image: book.image,
                    price: book.price,
                    quantity,
                }
                updatedCart = [...state.cartItems, newItem]
            }
            break
        }

        case 'REMOVE_FROM_CART': {
            const idToRemove = action.payload
            updatedCart = state.cartItems.filter(item => String(item.id) !== String(idToRemove))
            break
        }

        case 'INCREASE_QUANTITY': {
            const id = action.payload
            updatedCart = state.cartItems.map(item =>
                String(item.id) === String(id)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
            break
        }

        case 'DECREASE_QUANTITY': {
            const id = action.payload
            updatedCart = state.cartItems
                .map(item =>
                    String(item.id) === String(id)
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter(item => item.quantity > 0)
            break
        }

        case 'CLEAR_CART': {
            updatedCart = []
            break
        }

        default:
            return state
    }

    try {
        localStorage.setItem('bookverse_cart', JSON.stringify(updatedCart))
    } catch (e) {
        console.error('Failed to save cart to localStorage:', e)
    }

    return {
        ...state,
        cartItems: updatedCart,
    }
}
