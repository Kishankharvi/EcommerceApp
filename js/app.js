// Main Application Controller
window.App = (() => {
  let currentPage = "home"
  let products = []
  let cartItems = []
  let cartTotal = 0
  let cartItemCount = 0
  let isLoading = true

  // Initialize app
  async function init() {
    try {
      console.log("🔧 Initializing NeoShop...")

      // Load sample data
      loadSampleProducts()

      // Initialize Firebase
      // window.FirebaseService.init()

      // Initialize managers
      window.AuthManager.init()
      window.ProductManager.init()
      window.CartManager.init()
      window.CheckoutManager.init()
      window.ProfileManager.init()

      // Set up event listeners
      setupEventListeners()

      // Handle initial route
      handleInitialRoute()

      // Hide loading screen
      hideLoadingScreen()

      // Initialize scroll animations
      initScrollAnimations()

      // Show success message
      showNotification("Welcome to NeoShop! 🚀", "success")

      console.log("✅ NeoShop initialized successfully")
    } catch (error) {
      console.error("❌ App initialization error:", error)
      showNotification("Failed to initialize app", "error")
    }
  }

  // Load sample products
  const loadSampleProducts = () => {
    if (window.SAMPLE_PRODUCTS) {
      products = window.SAMPLE_PRODUCTS
      renderFeaturedProducts()
      renderAllProducts()
      console.log(`📦 Loaded ${products.length} sample products`)
    }
  }

  // Set up event listeners
  const setupEventListeners = () => {
    // Navigation
    const shopNowBtn = document.getElementById("shop-now-btn")
    const cartBtn = document.getElementById("cart-btn")
    const authBtn = document.getElementById("auth-btn")

    if (shopNowBtn) {
      shopNowBtn.addEventListener("click", () => navigateToPage("products"))
    }

    if (cartBtn) {
      cartBtn.addEventListener("click", () => navigateToPage("cart"))
    }

    if (authBtn) {
      authBtn.addEventListener("click", () => navigateToPage("login"))
    }

    // Auth forms
    const loginForm = document.getElementById("login-form")
    const registerForm = document.getElementById("register-form")

    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin)
    }

    if (registerForm) {
      registerForm.addEventListener("submit", handleRegister)
    }

    // Auth navigation
    const showRegisterBtn = document.getElementById("show-register")
    const showLoginBtn = document.getElementById("show-login")

    if (showRegisterBtn) {
      showRegisterBtn.addEventListener("click", (e) => {
        e.preventDefault()
        navigateToPage("register")
      })
    }

    if (showLoginBtn) {
      showLoginBtn.addEventListener("click", (e) => {
        e.preventDefault()
        navigateToPage("login")
      })
    }

    // Close modal events
    const closeBtn = document.getElementById("close-notification")
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal)
    }

    // Click outside modal to close
    const modal = document.getElementById("notification-modal")
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal()
        }
      })
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal()
      }
    })

    // Handle browser back/forward
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.page) {
        navigateToPage(e.state.page, false)
      }
    })

    // Handle online/offline status
    window.addEventListener("online", () => {
      showNotification("Connection restored", "success")
    })

    window.addEventListener("offline", () => {
      showNotification("You are offline", "warning")
    })
  }

  // Navigation
  const navigateToPage = (pageId, updateHistory = true) => {
    if (!isValidPage(pageId)) {
      console.warn(`Invalid page: ${pageId}`)
      return
    }

    // Hide current page
    const currentPageElement = document.querySelector(".page.active")
    if (currentPageElement) {
      currentPageElement.classList.remove("active")
    }

    // Show new page
    const newPageElement = document.getElementById(`${pageId}-page`)
    if (newPageElement) {
      newPageElement.classList.add("active")
      window.Utils.animate.slideUp(newPageElement)
    }

    // Update current page
    currentPage = pageId

    // Update URL and history
    if (updateHistory) {
      const url = pageId === "home" ? "/" : `/#${pageId}`
      history.pushState({ page: pageId }, "", url)
    }

    // Update header state
    updateHeaderState()

    // Handle page-specific logic
    handlePageSpecificLogic(pageId)

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Validate page ID
  const isValidPage = (pageId) => {
    const validPages = ["home", "products", "product-detail", "cart", "checkout", "login", "register", "profile"]
    return validPages.includes(pageId)
  }

  // Update header state based on current page
  const updateHeaderState = () => {
    const header = document.getElementById("header")
    if (header) {
      // Add/remove classes based on current page
      header.classList.toggle("transparent", currentPage === "home")
    }
  }

  // Handle page-specific logic
  const handlePageSpecificLogic = (pageId) => {
    switch (pageId) {
      case "products":
        // Ensure products are loaded
        if (window.ProductManager.getProducts().length === 0) {
          window.ProductManager.loadProducts()
        }
        break

      case "cart":
        // Render cart page
        window.CartManager.renderCartPage()
        break

      case "profile":
        // Check authentication and render profile
        if (window.AuthManager.requireAuth()) {
          window.ProfileManager.renderProfile()
        }
        break

      case "checkout":
        // Check authentication and cart
        if (!window.AuthManager.requireAuth()) {
          return
        }
        if (window.CartManager.getItems().length === 0) {
          showNotification("Your cart is empty", "warning")
          navigateToPage("cart")
          return
        }
        window.CartManager.renderCheckoutPage()
        break
    }
  }

  // Render products
  const renderFeaturedProducts = () => {
    const container = document.getElementById("featured-products")
    if (!container) return

    const featuredProducts = products.slice(0, 8)
    container.innerHTML = featuredProducts.map(createProductCard).join("")
  }

  const renderAllProducts = () => {
    const container = document.getElementById("all-products")
    if (!container) return

    container.innerHTML = products.map(createProductCard).join("")
  }

  const createProductCard = (product) => {
    const formattedPrice = window.Utils ? window.Utils.formatCurrency(product.price) : `$${product.price}`

    return `
      <div class="product-card hover-lift">
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">${formattedPrice}</div>
        <button class="add-to-cart-btn btn-ripple" onclick="window.App.addToCart('${product.id}')">
          Add to Cart
        </button>
      </div>
    `
  }

  // Cart functionality
  const addToCart = (productId) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const existingItem = cartItems.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
      })
    }

    calculateCartTotals()
    updateCartUI()
    window.CartManager.saveCartToStorage()
    showNotification(`${product.name} added to cart!`, "success")
  }

  const removeFromCart = (productId) => {
    cartItems = cartItems.filter((item) => item.id !== productId)
    calculateCartTotals()
    updateCartUI()
    window.CartManager.saveCartToStorage()
    window.CartManager.renderCartPage()
  }

  const updateCartQuantity = (productId, quantity) => {
    const item = cartItems.find((item) => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
        calculateCartTotals()
        updateCartUI()
        window.CartManager.saveCartToStorage()
        window.CartManager.renderCartPage()
      }
    }
  }

  const calculateCartTotals = () => {
    cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const updateCartUI = () => {
    const cartCountElement = document.getElementById("cart-count")
    if (cartCountElement) {
      cartCountElement.textContent = cartItemCount
      cartCountElement.style.display = cartItemCount > 0 ? "flex" : "none"
    }
  }

  const renderCartPage = () => {
    const cartContent = document.getElementById("cart-content")
    const cartSummary = document.getElementById("cart-summary")

    if (!cartContent || !cartSummary) return

    if (cartItems.length === 0) {
      cartContent.innerHTML = `
        <div class="empty-cart animate-fade-in">
          <div class="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
          <button class="cta-button" onclick="navigateToPage('products')">
            Continue Shopping
          </button>
        </div>
      `
      cartSummary.innerHTML = ""
      return
    }

    // Render cart items
    cartContent.innerHTML = cartItems
      .map((item) => {
        const formattedPrice = window.Utils ? window.Utils.formatCurrency(item.price) : `$${item.price}`
        const formattedTotal = window.Utils
          ? window.Utils.formatCurrency(item.price * item.quantity)
          : `$${(item.price * item.quantity).toFixed(2)}`

        return `
        <div class="cart-item animate-slide-up">
          <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p>${formattedPrice} each</p>
          </div>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="window.App.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="window.App.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
          <div class="item-total">${formattedTotal}</div>
          <button class="remove-btn" onclick="window.App.removeFromCart('${item.id}')">Remove</button>
        </div>
      `
      })
      .join("")

    // Render cart summary
    const formattedSubtotal = window.Utils ? window.Utils.formatCurrency(cartTotal) : `$${cartTotal.toFixed(2)}`
    const tax = cartTotal * 0.08
    const formattedTax = window.Utils ? window.Utils.formatCurrency(tax) : `$${tax.toFixed(2)}`
    const total = cartTotal + tax
    const formattedTotal = window.Utils ? window.Utils.formatCurrency(total) : `$${total.toFixed(2)}`

    cartSummary.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal (${cartItemCount} items)</span>
        <span>${formattedSubtotal}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>Free</span>
      </div>
      <div class="summary-row">
        <span>Tax</span>
        <span>${formattedTax}</span>
      </div>
      <div class="summary-row">
        <strong>Total</strong>
        <strong>${formattedTotal}</strong>
      </div>
      <button class="checkout-btn" onclick="window.App.handleCheckout()">
        Proceed to Checkout
      </button>
    `
  }

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault()

    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value

    // Simulate login
    showNotification("Login successful! Welcome back!", "success")
    navigateToPage("home")
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    const name = document.getElementById("register-name").value
    const email = document.getElementById("register-email").value
    const password = document.getElementById("register-password").value

    // Simulate registration
    showNotification("Account created successfully! Welcome!", "success")
    navigateToPage("home")
  }

  const handleCheckout = () => {
    showNotification("Checkout feature coming soon!", "info")
  }

  // Utility functions
  const showLoadingScreen = () => {
    const loadingScreen = document.getElementById("loading-screen")
    if (loadingScreen) {
      loadingScreen.style.display = "flex"
      isLoading = true
    }
  }

  const hideLoadingScreen = () => {
    const loadingScreen = document.getElementById("loading-screen")
    if (loadingScreen) {
      window.Utils.animate.fadeOut(loadingScreen, 500)
      setTimeout(() => {
        loadingScreen.style.display = "none"
        isLoading = false
      }, 500)
    }
  }

  const showNotification = (message, type = "info", duration = window.CONFIG.notifications.duration) => {
    const container = document.getElementById("notification-container")
    if (!container) return

    const notification = document.createElement("div")
    notification.className = `notification notification-${type} animate-slide-up`

    const icon = getNotificationIcon(type)

    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `

    // Add close functionality
    const closeBtn = notification.querySelector(".notification-close")
    closeBtn.addEventListener("click", () => {
      removeNotification(notification)
    })

    container.appendChild(notification)

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(notification)
    }, duration)
  }

  const getNotificationIcon = (type) => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    }
    return icons[type] || icons.info
  }

  const removeNotification = (notification) => {
    if (notification && notification.parentNode) {
      notification.classList.add("notification-exit")
      setTimeout(() => {
        notification.remove()
      }, 300)
    }
  }

  const closeModal = () => {
    const modal = document.getElementById("notification-modal")
    if (modal) {
      modal.classList.remove("active")
    }
  }

  const initScrollAnimations = () => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed")
        }
      })
    }, observerOptions)

    // Observe elements with scroll-reveal class
    document.querySelectorAll(".scroll-reveal").forEach((el) => {
      observer.observe(el)
    })
  }

  // Handle initial route
  const handleInitialRoute = () => {
    const path = window.location.hash.substring(1)
    navigateToPage(path || "home", false)
  }

  // Public API
  return {
    init,
    navigateToPage,
    showNotification,
    closeModal,
    getCurrentPage: () => currentPage,
    isLoading: () => isLoading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    handleCheckout,
  }
})()

// Initialize app when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.App.init)
} else {
  window.App.init()
}

console.log("📱 App.js loaded successfully")
