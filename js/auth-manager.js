// Authentication Manager
window.AuthManager = (() => {
  let currentUser = null
  let isAuthenticated = false

  // Initialize authentication
  function init() {
    setupEventListeners()

    // Listen for auth state changes
    window.EventBus.on("authStateChanged", handleAuthStateChange)
  }

  function setupEventListeners() {
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

  async function handleLogin(e) {
    e.preventDefault()

    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value

    // Validate inputs
    if (!window.Utils.validate.email(email)) {
      window.App.showNotification("Please enter a valid email address", "error")
      return
    }

    if (!window.Utils.validate.password(password)) {
      window.App.showNotification("Password must be at least 6 characters", "error")
      return
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Signing in..."
    submitBtn.disabled = true

    try {
      const result = await window.FirebaseService.signIn(email, password)

      if (result.success) {
        window.App.showNotification("Welcome back!", "success")
        window.App.navigateToPage("home")
      } else {
        window.App.showNotification(result.error, "error")
      }
    } catch (error) {
      window.App.showNotification("An error occurred. Please try again.", "error")
    } finally {
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }
  }

  async function handleRegister(e) {
    e.preventDefault()

    const name = document.getElementById("register-name").value
    const email = document.getElementById("register-email").value
    const password = document.getElementById("register-password").value

    // Validate inputs
    if (!window.Utils.validate.required(name)) {
      window.App.showNotification("Please enter your full name", "error")
      return
    }

    if (!window.Utils.validate.email(email)) {
      window.App.showNotification("Please enter a valid email address", "error")
      return
    }

    if (!window.Utils.validate.password(password)) {
      window.App.showNotification("Password must be at least 6 characters", "error")
      return
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Creating account..."
    submitBtn.disabled = true

    try {
      const result = await window.FirebaseService.signUp(email, password, name)

      if (result.success) {
        window.App.showNotification("Account created successfully!", "success")
        window.App.navigateToPage("home")
      } else {
        window.App.showNotification(result.error, "error")
      }
    } catch (error) {
      window.App.showNotification("An error occurred. Please try again.", "error")
    } finally {
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }
  }

  async function handleGoogleAuth() {
    try {
      const result = await window.FirebaseService.signInWithGoogle()

      if (result.success) {
        window.App.showNotification("Welcome!", "success")
        window.App.navigateToPage("home")
      } else {
        window.App.showNotification(result.error, "error")
      }
    } catch (error) {
      window.App.showNotification("Google sign-in failed. Please try again.", "error")
    }
  }

  async function handleLogout() {
    try {
      const result = await window.FirebaseService.signOut()

      if (result.success) {
        window.App.showNotification("Logged out successfully", "success")
        window.App.navigateToPage("home")
      } else {
        window.App.showNotification("Logout failed. Please try again.", "error")
      }
    } catch (error) {
      window.App.showNotification("An error occurred during logout", "error")
    }
  }

  function handleAuthStateChange(user) {
    currentUser = user
    isAuthenticated = !!user

    // Update UI based on auth state
    updateAuthUI()

    // Load user's cart if authenticated
    if (user && window.CartManager) {
      window.CartManager.loadUserCart(user.uid)
    }

    // Emit event for other components
    window.EventBus.emit("userAuthChanged", { user, isAuthenticated })
  }

  function updateAuthUI() {
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

  function handleAuthButtonClick() {
    if (isAuthenticated) {
      handleLogout()
    } else {
      showLoginPage()
    }
  }

  function handleProfileClick() {
    if (isAuthenticated) {
      window.App.navigateToPage("profile")
    } else {
      showLoginPage()
    }
  }

  function showLoginPage() {
    window.App.navigateToPage("login")
  }

  function showRegisterPage() {
    window.App.navigateToPage("register")
  }

  // Check if user is authenticated
  function requireAuth() {
    if (!isAuthenticated) {
      window.App.showNotification("Please log in to continue", "warning")
      showLoginPage()
      return false
    }
    return true
  }

  // Get current user data
  function getCurrentUser() {
    return currentUser
  }

  // Get user display name
  function getUserDisplayName() {
    if (currentUser) {
      return currentUser.displayName || currentUser.email || "User"
    }
    return null
  }

  // Public API
  return {
    init,
    requireAuth,
    getCurrentUser,
    getUserDisplayName,
    isAuthenticated: () => isAuthenticated,
  }
})()

console.log("✅ Auth Manager loaded")
