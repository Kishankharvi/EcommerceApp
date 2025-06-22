// Sample data for demo purposes when Firebase is not configured
const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Quantum Smartphone X1",
    description: "Next-generation smartphone with quantum processing capabilities and holographic display.",
    price: 1299.99,
    category: "Electronics",
    imageUrl: "/images/download.jpeg",
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Neural VR Headset",
    description: "Immersive virtual reality headset with direct neural interface technology.",
    price: 899.99,
    category: "Electronics",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Cyber Jacket Pro",
    description: "Smart jacket with built-in climate control and biometric monitoring.",
    price: 599.99,
    category: "Fashion",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: false,
  },
  {
    id: "4",
    name: "Holographic Watch",
    description: "Luxury timepiece with 3D holographic display and AI assistant.",
    price: 2499.99,
    category: "Accessories",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: true,
  },
  {
    id: "5",
    name: "Anti-Gravity Sneakers",
    description: "Revolutionary footwear with magnetic levitation technology.",
    price: 799.99,
    category: "Fashion",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: false,
    featured: false,
  },
  {
    id: "6",
    name: "Plasma Energy Drink",
    description: "Enhanced energy drink with nano-nutrients and electrolytes.",
    price: 29.99,
    category: "Food & Beverage",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: false,
  },
  {
    id: "7",
    name: "Quantum Laptop Ultra",
    description: "Ultra-portable laptop with quantum computing capabilities.",
    price: 3999.99,
    category: "Electronics",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: true,
  },
  {
    id: "8",
    name: "Biometric Backpack",
    description: "Smart backpack with fingerprint lock and solar charging panel.",
    price: 299.99,
    category: "Accessories",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: false,
  },
]

// Mock Firebase service for demo
const createMockFirebaseService = () => {
  return {
    init: () => {
      console.log("Using mock Firebase service for demo")
      return true
    },

    getProducts: async (limit = 20) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return {
        success: true,
        products: SAMPLE_PRODUCTS.slice(0, limit),
      }
    },

    getProduct: async (productId) => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const product = SAMPLE_PRODUCTS.find((p) => p.id === productId)
      return product ? { success: true, product } : { success: false, error: "Product not found" }
    },

    signIn: async (email, password) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        user: {
          uid: "demo-user",
          email: email,
          displayName: "Demo User",
        },
      }
    },

    signUp: async (email, password, displayName) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        user: {
          uid: "demo-user",
          email: email,
          displayName: displayName,
        },
      }
    },

    signInWithGoogle: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        user: {
          uid: "demo-user",
          email: "demo@example.com",
          displayName: "Demo User",
        },
      }
    },

    signOut: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: true }
    },

    saveCart: async (userId, cartItems) => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return { success: true }
    },

    getCart: async (userId) => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return { success: true, cart: { items: [] } }
    },

    createOrder: async (userId, orderData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        order: {
          ...orderData,
          id: "demo-order-" + Date.now(),
          orderNumber: "ORD-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
        },
      }
    },

    getUserOrders: async (userId) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return { success: true, orders: [] }
    },

    updateUserDocument: async (userId, data) => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return { success: true }
    },

    getCurrentUser: () => null,
  }
}

// Initialize mock service if Firebase is not available
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (!window.firebaseService || !window.firebase) {
      console.log("Firebase not available, using mock service")
      window.firebaseService = createMockFirebaseService()

      // Emit auth state change for demo
      if (window.EventBus) {
        setTimeout(() => {
          window.EventBus.emit("authStateChanged", null)
        }, 100)
      }
    }
  }, 50)
})

// Make sample data available globally
window.SAMPLE_PRODUCTS = SAMPLE_PRODUCTS
