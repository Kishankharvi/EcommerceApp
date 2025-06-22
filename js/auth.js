// Authentication Management
let currentUser = null
let isAuthenticated = false

// Wait for dependencies to load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize auth after a short delay
  setTimeout(() => {
    initAuth()
  }, 200)
})

// Initialize authentication
const initAuth = () => {
  // Wait for EventBus to be available
  if (window.EventBus) {
    // Listen for auth state changes
    window.EventBus.on("authStateChanged", handleAuthStateChange)
  }

  // Set up event listeners
  setupAuthEventListeners()
}

const setupAuthEventListeners = () => {
  // Login form
  const loginForm = document.getElementById("login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Register form
  const registerForm = document.getElementById("register-form")
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }

  // Google login buttons
  const googleLoginBtn = document.getElementById("google-login")
  const googleRegisterBtn = document.getElementById("google-register")

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", handleGoogleAuth)
  }

  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", handleGoogleAuth)
  }

  // Auth button in header
  const authBtn = document.getElementById("auth-btn")
  if (authBtn) {
    authBtn.addEventListener("click", handleAuthButtonClick)
  }

  // Profile button
  const profileBtn = document.getElementById("profile-btn")
  if (profileBtn) {
    profileBtn.addEventListener("click", handleProfileClick)
  }

  // Auth page navigation
  const showRegisterBtn = document.getElementById("show-register")
  const showLoginBtn = document.getElementById("show-login")

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", showRegisterPage)
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", showLoginPage)
  }
}

const handleLogin = async (e) => {
  e.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  // Validate inputs
  if (!window.Utils.validate.email(email)) {
    showNotification("Please enter a valid email address", "error")
    return
  }

  if (!window.Utils.validate.password(password)) {
    showNotification("Password must be at least 6 characters", "error")
    return
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent
  submitBtn.textContent = "Signing in..."
  submitBtn.disabled = true

  try {
    const result = await window.firebaseService.signIn(email, password)

    if (result.success) {
      showNotification("Welcome back!", "success")
      navigateToPage("home")
    } else {
      showNotification(result.error, "error")
    }
  } catch (error) {
    showNotification("An error occurred. Please try again.", "error")
  } finally {
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

const handleRegister = async (e) => {
  e.preventDefault()

  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value

  // Validate inputs
  if (!window.Utils.validate.required(name)) {
    showNotification("Please enter your full name", "error")
    return
  }

  if (!window.Utils.validate.email(email)) {
    showNotification("Please enter a valid email address", "error")
    return
  }

  if (!window.Utils.validate.password(password)) {
    showNotification("Password must be at least 6 characters", "error")
    return
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent
  submitBtn.textContent = "Creating account..."
  submitBtn.disabled = true

  try {
    const result = await window.firebaseService.signUp(email, password, name)

    if (result.success) {
      showNotification("Account created successfully!", "success")
      navigateToPage("home")
    } else {
      showNotification(result.error, "error")
    }
  } catch (error) {
    showNotification("An error occurred. Please try again.", "error")
  } finally {
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

const handleGoogleAuth = async () => {
  try {
    const result = await window.firebaseService.signInWithGoogle()

    if (result.success) {
      showNotification("Welcome!", "success")
      navigateToPage("home")
    } else {
      showNotification(result.error, "error")
    }
  } catch (error) {
    showNotification("Google sign-in failed. Please try again.", "error")
  }
}

const handleLogout = async () => {
  try {
    const result = await window.firebaseService.signOut()

    if (result.success) {
      showNotification("Logged out successfully", "success")
      navigateToPage("home")
    } else {
      showNotification("Logout failed. Please try again.", "error")
    }
  } catch (error) {
    showNotification("An error occurred during logout", "error")
  }
}

const handleAuthStateChange = (user) => {
  currentUser = user
  isAuthenticated = !!user

  // Update UI based on auth state
  updateAuthUI()

  // Load user's cart if authenticated
  if (user && window.loadUserCart) {
    window.loadUserCart(user.uid)
  }

  // Emit event for other components
  if (window.EventBus) {
    window.EventBus.emit("userAuthChanged", { user, isAuthenticated })
  }
}

const updateAuthUI = () => {
  const authBtn = document.getElementById("auth-btn")
  const profileBtn = document.getElementById("profile-btn")

  if (isAuthenticated) {
    if (authBtn) {
      authBtn.textContent = "Logout"
      authBtn.onclick = handleLogout
    }

    if (profileBtn) {
      profileBtn.style.display = "block"
    }
  } else {
    if (authBtn) {
      authBtn.textContent = "Login"
      authBtn.onclick = showLoginPage
    }

    if (profileBtn) {
      profileBtn.style.display = "none"
    }
  }
}

const handleAuthButtonClick = () => {
  if (isAuthenticated) {
    handleLogout()
  } else {
    showLoginPage()
  }
}

const handleProfileClick = () => {
  if (isAuthenticated) {
    navigateToPage("profile")
  } else {
    showLoginPage()
  }
}

const showLoginPage = () => {
  navigateToPage("login")
}

const showRegisterPage = () => {
  navigateToPage("register")
}

// Check if user is authenticated
const requireAuth = () => {
  if (!isAuthenticated) {
    showNotification("Please log in to continue", "warning")
    showLoginPage()
    return false
  }
  return true
}

// Get current user data
const getCurrentUser = () => {
  return currentUser
}

// Get user display name
const getUserDisplayName = () => {
  if (currentUser) {
    return currentUser.displayName || currentUser.email || "User"
  }
  return null
}

// Helper functions
const navigateToPage = (pageId) => {
  if (window.app) {
    window.app.navigateToPage(pageId)
  }
}

const showNotification = (message, type = "info") => {
  if (window.app) {
    window.app.showNotification(message, type)
  }
}

// Auth manager object
const authManager = {
  init: initAuth,
  requireAuth,
  getCurrentUser,
  getUserDisplayName,
  isAuthenticated: () => isAuthenticated,
}

// Make available globally
window.authManager = authManager
