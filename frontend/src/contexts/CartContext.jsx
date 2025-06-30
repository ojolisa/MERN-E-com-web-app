import { createContext, useContext, useReducer, useEffect } from "react";
import { cartAPI, authAPI } from "../services/api";

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CART":
      return {
        ...state,
        items: action.payload,
      };

    case "ADD_TO_CART":
      const existingItemIndex = state.items.findIndex(
        (item) => item.product._id === action.payload.product._id
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
        return {
          ...state,
          items: updatedItems,
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product._id !== action.payload
        ),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product._id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from backend on component mount if user is authenticated
  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Load cart from backend if user is authenticated
          const response = await authAPI.getProfile();
          const backendCart = response.user.cart || [];

          // Transform backend cart format to frontend format
          const transformedCart = backendCart.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
          }));

          dispatch({ type: "LOAD_CART", payload: transformedCart });
        } catch (error) {
          console.error("Failed to load cart from backend:", error);
          // Fallback to localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              const cartItems = JSON.parse(savedCart);
              dispatch({ type: "LOAD_CART", payload: cartItems });
            } catch (error) {
              console.error("Failed to load cart from localStorage:", error);
            }
          }
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart);
            dispatch({ type: "LOAD_CART", payload: cartItems });
          } catch (error) {
            console.error("Failed to load cart from localStorage:", error);
          }
        }
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever items change (for non-authenticated users)
  // For authenticated users, changes are saved to backend immediately
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items]);

  // Cart actions
  const addToCart = async (product, quantity = 1) => {
    // Check if product is in stock
    if (product.stock === 0) {
      throw new Error("Product is out of stock");
    }

    // Check if adding this quantity would exceed stock
    const existingItem = state.items.find(
      (item) => item.product._id === product._id
    );
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity + quantity > product.stock) {
      throw new Error("Not enough stock available");
    }

    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Sync with backend if user is authenticated
        await cartAPI.addToCart(product._id, quantity);
      } catch (error) {
        console.error("Failed to add to cart in backend:", error);
        // Continue with local state update even if backend fails
      }
    }

    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity },
    });
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Sync with backend if user is authenticated
        await cartAPI.removeFromCart(productId);
      } catch (error) {
        console.error("Failed to remove from cart in backend:", error);
        // Continue with local state update even if backend fails
      }
    }

    dispatch({
      type: "REMOVE_FROM_CART",
      payload: productId,
    });
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    // Find the product to check stock
    const item = state.items.find((item) => item.product._id === productId);
    if (item && quantity > item.product.stock) {
      throw new Error("Not enough stock available");
    }

    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Sync with backend if user is authenticated
        await cartAPI.updateQuantity(productId, quantity);
      } catch (error) {
        console.error("Failed to update quantity in backend:", error);
        // Continue with local state update even if backend fails
      }
    }

    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { productId, quantity },
    });
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Sync with backend if user is authenticated
        await cartAPI.clearCart();
      } catch (error) {
        console.error("Failed to clear cart in backend:", error);
        // Continue with local state update even if backend fails
      }
    }

    dispatch({ type: "CLEAR_CART" });
  };

  // Sync cart with backend when user logs in
  const syncCartWithBackend = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Get current localStorage cart
      const localCart = state.items;

      // If there are items in local cart, sync them to backend
      if (localCart.length > 0) {
        for (const item of localCart) {
          try {
            await cartAPI.addToCart(item.product._id, item.quantity);
          } catch (error) {
            console.error("Failed to sync cart item to backend:", error);
          }
        }
      }

      // Load the updated cart from backend
      const response = await authAPI.getProfile();
      const backendCart = response.user.cart || [];

      // Transform backend cart format to frontend format
      const transformedCart = backendCart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      }));

      dispatch({ type: "LOAD_CART", payload: transformedCart });

      // Clear localStorage cart after successful sync
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Failed to sync cart with backend:", error);
    }
  };

  // Clear cart when user logs out
  const clearCartOnLogout = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const isInCart = (productId) => {
    return state.items.some((item) => item.product._id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartWithBackend,
    clearCartOnLogout,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
