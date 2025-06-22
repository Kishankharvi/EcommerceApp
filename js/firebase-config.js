// Firebase Configuration and Initialization
// Access global variables
const EventBus = window.EventBus
const CONFIG = window.CONFIG
const firebase = window.firebase // Declare the firebase variable

let firebaseApp = null
let auth = null
let db = null
let storage = null
let currentUser = null

// Initialize Firebase
const initFirebase = () => {
  try {
    // Check if Firebase is available
    if (typeof firebase === "undefined") {
      console.error("Firebase is not loaded")
      return false
    }

    // Initialize Firebase App
    firebaseApp = window.firebase.initializeApp(CONFIG.firebase)

    // Initialize services
    auth = window.firebase.auth()
    db = window.firebase.firestore()
    storage = window.firebase.storage()

    // Set up auth state listener
    auth.onAuthStateChanged((user) => {
      currentUser = user
      if (EventBus) {
        EventBus.emit("authStateChanged", user)
      }
    })

    console.log("Firebase initialized successfully")
    return true
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return false
  }
}

// Authentication Functions
const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password)
    const user = userCredential.user

    // Update user profile
    await user.updateProfile({
      displayName: displayName,
    })

    // Create user document in Firestore
    await createUserDocument(user, { displayName })

    return { success: true, user }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: error.message }
  }
}

const signIn = async (email, password) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: error.message }
  }
}

const signInWithGoogle = async () => {
  try {
    const provider = new window.firebase.auth.GoogleAuthProvider()
    const userCredential = await auth.signInWithPopup(provider)
    const user = userCredential.user

    // Create or update user document
    await createUserDocument(user)

    return { success: true, user }
  } catch (error) {
    console.error("Google sign in error:", error)
    return { success: false, error: error.message }
  }
}

const signOut = async () => {
  try {
    await auth.signOut()
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: error.message }
  }
}

// User Document Management
const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return

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

const getUserDocument = async (userId) => {
  try {
    const userRef = db.collection("users").doc(userId)
    const snapshot = await userRef.get()
    return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null
  } catch (error) {
    console.error("Error getting user document:", error)
    return null
  }
}

const updateUserDocument = async (userId, data) => {
  try {
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
const getProducts = async (limit = 20) => {
  try {
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

const getProduct = async (productId) => {
  try {
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

const searchProducts = async (query) => {
  try {
    const snapshot = await db
      .collection("products")
      .where("name", ">=", query)
      .where("name", "<=", query + "\uf8ff")
      .get()

    const products = []
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() })
    })

    return { success: true, products }
  } catch (error) {
    console.error("Error searching products:", error)
    return { success: false, error: error.message }
  }
}

// Cart Management
const saveCart = async (userId, cartItems) => {
  try {
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

const getCart = async (userId) => {
  try {
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
const createOrder = async (userId, orderData) => {
  try {
    const orderRef = db.collection("orders").doc()
    const order = {
      id: orderRef.id,
      userId,
      ...orderData,
      status: "pending",
      createdAt: new Date(),
    }

    await orderRef.set(order)

    // Clear user's cart after successful order
    await saveCart(userId, [])

    return { success: true, order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: error.message }
  }
}

const getUserOrders = async (userId) => {
  try {
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

const updateOrderStatus = async (orderId, status) => {
  try {
    await db.collection("orders").doc(orderId).update({
      status,
      updatedAt: new Date(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: error.message }
  }
}

// File Upload
const uploadFile = async (file, path) => {
  try {
    const storageRef = storage.ref().child(path)
    const snapshot = await storageRef.put(file)
    const downloadURL = await snapshot.ref.getDownloadURL()
    return { success: true, url: downloadURL }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: error.message }
  }
}

// Firebase service object
const firebaseService = {
  init: initFirebase,
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  getProducts,
  getProduct,
  searchProducts,
  saveCart,
  getCart,
  createOrder,
  getUserOrders,
  updateOrderStatus,
  uploadFile,
  getCurrentUser: () => currentUser,
}

// Firebase Configuration and Initialization
// Wait for DOM and global variables to be available
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Firebase after a short delay to ensure all dependencies are loaded
  setTimeout(() => {
    initFirebase()
  }, 100)
})

// Make available globally
window.firebaseService = firebaseService
