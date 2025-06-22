// Application Configuration
const CONFIG = {
  // Firebase Configuration (Replace with your actual config)
  firebase: {
 apiKey: "AIzaSyCMLy8t7oCWAyCR3Bo5CJGGBs7vJmS8Osc",
  authDomain: "ecommerceapp-65be9.firebaseapp.com",
  projectId: "ecommerceapp-65be9",
  storageBucket: "ecommerceapp-65be9.firebasestorage.app",
  messagingSenderId: "4445606619",
  appId: "1:4445606619:web:7c2bf32e068ac3dc11b2fe",
  measurementId: "G-YNJXJPLXTK"
  },

  // Stripe Configuration
  stripe: {
    publishableKey: "pk_test_your_stripe_publishable_key",
  },

  // App Settings
  app: {
    name: "NeoShop",
    version: "1.0.0",
    currency: "USD",
    currencySymbol: "$",
    itemsPerPage: 12,
    maxCartItems: 99,
  },

  // Storage Keys
  storage: {
    cart: "neoshop_cart",
    user: "neoshop_user",
    theme: "neoshop_theme",
    wishlist: "neoshop_wishlist",
  },

  // Animation Settings
  animations: {
    duration: 300,
    easing: "ease-out",
    staggerDelay: 100,
  },

  // Notification Settings
  notifications: {
    duration: 3000,
    position: "top-right",
  },
}

// Sample Products Data
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
    imageUrl: "/images/NeuralVrHeadset.jpeg",
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Cyber Jacket Pro",
    description: "Smart jacket with built-in climate control and biometric monitoring.",
    price: 599.99,
    category: "Fashion",
    imageUrl: "images/cyberjacket.jpeg",
    inStock: true,
    featured: false,
  },
  {
    id: "4",
    name: "Holographic Watch",
    description: "Luxury timepiece with 3D holographic display and AI assistant.",
    price: 2499.99,
    category: "Accessories",
    imageUrl: "/images/holographicwatch.jpeg",
    inStock: true,
    featured: true,
  },
  {
    id: "5",
    name: "Anti-Gravity Sneakers",
    description: "Revolutionary footwear with magnetic levitation technology.",
    price: 799.99,
    category: "Fashion",
    imageUrl: "/images/antigravitysneeakers.jpeg",
    inStock: false,
    featured: false,
  },
  {
    id: "6",
    name: "Plasma Energy Drink",
    description: "Enhanced energy drink with nano-nutrients and electrolytes.",
    price: 29.99,
    category: "Food & Beverage",
    imageUrl: "/images/plasmaenergydrink.jpeg",
    inStock: true,
    featured: false,
  },
  {
    id: "7",
    name: "Quantum Laptop Ultra",
    description: "Ultra-portable laptop with quantum computing capabilities.",
    price: 3999.99,
    category: "Electronics",
    imageUrl: "/images/quantumlaptop.jpeg",
    inStock: true,
    featured: true,
  },
  {
    id: "8",
    name: "Biometric Backpack",
    description: "Smart backpack with fingerprint lock and solar charging panel.",
    price: 299.99,
    category: "Accessories",
    imageUrl: "/images/biometricbackpack.jpeg",
    inStock: true,
    featured: false,
  },
]

// Utility Functions
const Utils = {
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: CONFIG.app.currency,
    }).format(amount)
  },

  // Format date
  formatDate: (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  },

  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Local storage helpers
  storage: {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        console.error("Storage set error:", error)
        return false
      }
    },

    get: (key) => {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error("Storage get error:", error)
        return null
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.error("Storage remove error:", error)
        return false
      }
    },
  },

  // Validation helpers
  validate: {
    email: (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },

    password: (password) => {
      return password && password.length >= 6
    },

    required: (value) => {
      return value && value.trim().length > 0
    },

    zipCode: (zip) => {
      const re = /^\d{5}(-\d{4})?$/
      return re.test(zip)
    },
  },
}

// Event Emitter
const createEventEmitter = () => {
  const events = {}
  return {
    on: (event, callback) => {
      if (!events[event]) events[event] = []
      events[event].push(callback)
    },
    emit: (event, data) => {
      if (events[event]) {
        events[event].forEach((callback) => callback(data))
      }
    },
  }
}

const EventBus = createEventEmitter()

// Make available globally
window.CONFIG = CONFIG
window.SAMPLE_PRODUCTS = SAMPLE_PRODUCTS
window.Utils = Utils
window.EventBus = EventBus

console.log("✅ Config and Utils loaded successfully")
