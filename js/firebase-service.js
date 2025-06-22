// Firebase Service
window.FirebaseService = (() => {
  let app = null
  let auth = null
  let db = null
  let storage = null
  let currentUser = null
  let isInitialized = false
  const firebase = window.firebase // Declare the firebase variable

  // Initialize Firebase
  function init() {
    try {
      if (typeof firebase === "undefined") {
        console.warn("Firebase not available, using mock service")
        return initMockService()
      }

      // Initialize Firebase App
      app = firebase.initializeApp(window.CONFIG.firebase)
      auth = firebase.auth()
      db = firebase.firestore()
      storage = firebase.storage()

      // Set up auth state listener
      auth.onAuthStateChanged((user) => {
        currentUser = user
        if (window.EventBus) {
          window.EventBus.emit("authStateChanged", user)
        }
      })

      isInitialized = true
      console.log("✅ Firebase initialized successfully")
      return true
    } catch (error) {
      console.error("❌ Firebase initialization error:", error)
      return initMockService()
    }
  }

  // Mock service for demo/development
  function initMockService() {
    console.log("🔧 Using mock Firebase service")
    isInitialized = true
    return true
  }

  // Authentication Functions
  async function signUp(email, password, displayName) {
    try {
      if (!isInitialized || !auth) {
        return mockAuthResponse(email, displayName)
      }

      const userCredential = await auth.createUserWithEmailAndPassword(email, password)
      const user = userCredential.user

      await user.updateProfile({ displayName })
      await createUserDocument(user, { displayName })

      return { success: true, user }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, error: error.message }
    }
  }

  async function signIn(email, password) {
    try {
      if (!isInitialized || !auth) {
        return mockAuthResponse(email)
      }

      const userCredential = await auth.signInWithEmailAndPassword(email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: error.message }
    }
  }

  async function signInWithGoogle() {
    try {
      if (!isInitialized || !auth) {
        return mockAuthResponse("demo@example.com", "Demo User")
      }

      const provider = new firebase.auth.GoogleAuthProvider()
      const userCredential = await auth.signInWithPopup(provider)
      const user = userCredential.user

      await createUserDocument(user)
      return { success: true, user }
    } catch (error) {
      console.error("Google sign in error:", error)
      return { success: false, error: error.message }
    }
  }

  async function signOut() {
    try {
      if (!isInitialized || !auth) {
        currentUser = null
        if (window.EventBus) {
          window.EventBus.emit("authStateChanged", null)
        }
        return { success: true }
      }

      await auth.signOut()
      return { success: true }
    } catch (error) {
      console.error("Sign out error:", error)
      return { success: false, error: error.message }
    }
  }

  // User Document Management
  async function createUserDocument(user, additionalData = {}) {
    if (!user || !db) return

    const userRef = db.collection("users").doc(user.uid)
    const snapshot = await userRef.get()

    if (!snapshot.exists) {
      const { displayName, email, photoURL } = user
      const createdAt = new Date()

      try {
        await userRef.set({
          displayName,
          email,
          photoURL,
          createdAt,
          ...additionalData,
        })
      } catch (error) {
        console.error("Error creating user document:", error)
      }
    }

    return userRef
  }

  async function getUserDocument(userId) {
    try {
      if (!db) return null

      const userRef = db.collection("users").doc(userId)
      const snapshot = await userRef.get()
      return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null
    } catch (error) {
      console.error("Error getting user document:", error)
      return null
    }
  }

  async function updateUserDocument(userId, data) {
    try {
      if (!db) return { success: true }

      const userRef = db.collection("users").doc(userId)
      await userRef.update({
        ...data,
        updatedAt: new Date(),
      })
      return { success: true }
    } catch (error) {
      console.error("Error updating user document:", error)
      return { success: false, error: error.message }
    }
  }

  // Product Management
  async function getProducts(limit = 20) {
    try {
      console.log("1"+db);
      console.log("2"+window.SAMPLE_PRODUCTS);
      if (!db) {
        // Return sample products for demo
        await new Promise((resolve) => setTimeout(resolve, 500))
        return { success: true, products: window.SAMPLE_PRODUCTS }
      }

      const snapshot = await db.collection("products").limit(limit).get()
      const products = []
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, products }
    } catch (error) {
      console.error("Error getting products:", error)
      return { success: false, error: error.message }
    }
  }

  async function getProduct(productId) {
    try {
      if (!db) {
        const product = window.SAMPLE_PRODUCTS.find((p) => p.id === productId)
        return product ? { success: true, product } : { success: false, error: "Product not found" }
      }

      const doc = await db.collection("products").doc(productId).get()
      if (doc.exists) {
        return { success: true, product: { id: doc.id, ...doc.data() } }
      } else {
        return { success: false, error: "Product not found" }
      }
    } catch (error) {
      console.error("Error getting product:", error)
      return { success: false, error: error.message }
    }
  }

  // Cart Management
  async function saveCart(userId, cartItems) {
    try {
      if (!db) return { success: true }

      const cartRef = db.collection("carts").doc(userId)
      await cartRef.set({
        items: cartItems,
        updatedAt: new Date(),
      })
      return { success: true }
    } catch (error) {
      console.error("Error saving cart:", error)
      return { success: false, error: error.message }
    }
  }

  async function getCart(userId) {
    try {
      if (!db) return { success: true, cart: { items: [] } }

      const doc = await db.collection("carts").doc(userId).get()
      if (doc.exists) {
        return { success: true, cart: doc.data() }
      } else {
        return { success: true, cart: { items: [] } }
      }
    } catch (error) {
      console.error("Error getting cart:", error)
      return { success: false, error: error.message }
    }
  }

  // Order Management
  async function createOrder(userId, orderData) {
    try {
      if (!db) {
        // Mock order creation
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return {
          success: true,
          order: {
            ...orderData,
            id: "demo-order-" + Date.now(),
            orderNumber: "ORD-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
          },
        }
      }

      const orderRef = db.collection("orders").doc()
      const order = {
        id: orderRef.id,
        userId,
        ...orderData,
        status: "pending",
        createdAt: new Date(),
      }

      await orderRef.set(order)
      await saveCart(userId, []) // Clear cart

      return { success: true, order }
    } catch (error) {
      console.error("Error creating order:", error)
      return { success: false, error: error.message }
    }
  }

  async function getUserOrders(userId) {
    try {
      if (!db) return { success: true, orders: [] }

      const snapshot = await db.collection("orders").where("userId", "==", userId).orderBy("createdAt", "desc").get()

      const orders = []
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, orders }
    } catch (error) {
      console.error("Error getting user orders:", error)
      return { success: false, error: error.message }
    }
  }

  // Mock auth response for demo
  function mockAuthResponse(email, displayName = "Demo User") {
    return {
      success: true,
      user: {
        uid: "demo-user-" + Date.now(),
        email: email,
        displayName: displayName,
        photoURL: null,
      },
    }
  }

  // Get current user
  function getCurrentUser() {
    return currentUser
  }

  // Public API
  return {
    init,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    createUserDocument,
    getUserDocument,
    updateUserDocument,
    getProducts,
    getProduct,
    saveCart,
    getCart,
    createOrder,
    getUserOrders,
    getCurrentUser,
  }
})()

console.log("✅ Firebase Service loaded")
