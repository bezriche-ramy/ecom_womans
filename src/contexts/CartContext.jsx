import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const { product, quantity = 1, selectedSize, selectedColor } = action.payload;
      
      // Create a unique cart item ID based on product ID, size, and color
      const cartItemId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`;
      
      const existingItem = state.items.find(item => item.cartItemId === cartItemId);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        const newItem = {
          cartItemId,
          productId: product.id,
          name: product.name,
          name_fr: product.name_fr,
          name_ar: product.name_ar,
          price: product.price,
          mainImageUrl: product.main_image_url,
          selectedSize: selectedSize || product.size,
          selectedColor: selectedColor || product.color,
          quantity,
          addedAt: new Date().toISOString()
        };
        
        return {
          ...state,
          items: [...state.items, newItem]
        };
      }
    }
    
    case CART_ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        items: state.items.filter(item => item.cartItemId !== action.payload.cartItemId)
      };
    
    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.cartItemId === action.payload.cartItemId
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };
    
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || []
      };
    
    default:
      return state;
  }
};

const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('blossom-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('blossom-cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { product, quantity, selectedSize, selectedColor }
    });
  };

  const removeFromCart = (cartItemId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: { cartItemId }
    });
  };

  const updateQuantity = (cartItemId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { cartItemId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart: state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CART_ACTIONS };
