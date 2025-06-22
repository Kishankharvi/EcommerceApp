// Cart Management
let cartItems = []
let cartTotal = 0
let cartItemCount = 0
let userId = null

// Wait for dependencies to load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    initCart()
  }, 400)
})

// Initialize cart
const initCart = () => {
  loadCartFromStorage()
  setupCartEventListeners()
  updateCartUI()

  // Listen for auth changes when EventBus is available
  if (window.EventBus) {
    window.EventBus.on("userAuthChanged", handleAuthChange)
  }
}

const setupCartEventListeners = () => {
  // Cart button in header
  const cartBtn = document.getElementById("cart-btn")
  if (cartBtn) {
    cartBtn.addEventListener("click", navigateToCart)
  }
}

const handleAuthChange = (data) => {
  if (data.isAuthenticated) {
    userId = data.user.uid
    loadUserCart(userId)
  } else {
    userId = null
    saveCartToStorage()
  }
}

const loadUserCart = async (userIdParam) => {
  try {
    if (!window.firebaseService) {
      console.error("Firebase service not available")
      return
    }

    const result = await window.firebaseService.getCart(userIdParam)

    if (result.success && result.cart.items) {
      cartItems = result.cart.items
      calculateTotals()
      updateCartUI()
    }
  } catch (error) {
    console.error("Error loading user cart:", error)
  }
}

const saveUserCart = async () => {
  if (userId && window.firebaseService) {
    try {
      await window.firebaseService.saveCart(userId, cartItems)
    } catch (error) {
      console.error("Error saving user cart:", error)
    }
  }
}

const loadCartFromStorage = () => {
  if (!window.Utils) return

  const storageKey = window.CONFIG ? window.CONFIG.storage.cart : "neoshop_cart"
  const savedCart = window.Utils.storage.get(storageKey)
  if (savedCart && Array.isArray(savedCart)) {
    cartItems = savedCart
    calculateTotals()
  }
}

const saveCartToStorage = () => {
  if (!window.Utils) return

  const storageKey = window.CONFIG ? window.CONFIG.storage.cart : "neoshop_cart"
  window.Utils.storage.set(storageKey, cartItems)
}

const addItem = (product, quantity = 1) => {
  const existingItem = cartItems.find((item) => item.id === product.id)
  const maxItems = window.CONFIG ? window.CONFIG.app.maxCartItems : 99

  if (existingItem) {
    existingItem.quantity += quantity
    if (existingItem.quantity > maxItems) {
      existingItem.quantity = maxItems
    }
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: Math.min(quantity, maxItems),
    })
  }

  calculateTotals()
  updateCartUI()
  saveCart()

  // Add animation effect
  animateCartButton()
}

const removeItem = (productId) => {
  cartItems = cartItems.filter((item) => item.id !== productId)
  calculateTotals()
  updateCartUI()
  saveCart()
  renderCartPage()
}

const updateQuantity = (productId, quantity) => {
  const item = cartItems.find((item) => item.id === productId)
  const maxItems = window.CONFIG ? window.CONFIG.app.maxCartItems : 99

  if (item) {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      item.quantity = Math.min(quantity, maxItems)
      calculateTotals()
      updateCartUI()
      saveCart()
      renderCartPage()
    }
  }
}

const clearCart = () => {
  cartItems = []
  calculateTotals()
  updateCartUI()
  saveCart()
  renderCartPage()
}

const calculateTotals = () => {
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

const animateCartButton = () => {
  const cartBtn = document.getElementById("cart-btn")
  if (cartBtn) {
    cartBtn.classList.add("animate-pulse")
    setTimeout(() => {
      cartBtn.classList.remove("animate-pulse")
    }, 600)
  }
}

const navigateToCart = () => {
  renderCartPage()
  navigateToPage("cart")
}

const renderCartPage = () => {
  const cartContent = document.getElementById("cart-content")
  const cartSummary = document.getElementById("cart-summary")

  if (!cartContent || !cartSummary) return

  if (cartItems.length === 0) {
    cartContent.innerHTML = getEmptyCartHTML()
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
            <img src="${item.imageUrl || "/placeholder.svg?height=100&width=100"}" 
                 alt="${item.name}" 
                 class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${formattedPrice} each</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">
                ${formattedTotal}
            </div>
            <button class="remove-btn" onclick="removeCartItem('${item.id}')">
                Remove
            </button>
        </div>
      `
    })
    .join("")

  // Render cart summary
  const formattedSubtotal = window.Utils ? window.Utils.formatCurrency(cartTotal) : `$${cartTotal.toFixed(2)}`
  const tax = cartTotal * 0.08
  const formattedTax = window.Utils ? window.Utils.formatCurrency(tax) : `$${tax.toFixed(2)}`
  const total = cartTotal * 1.08
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
        <button class="checkout-btn" onclick="proceedToCheckout()">
            Proceed to Checkout
        </button>
        <button class="clear-cart-btn" onclick="clearCartItems()">
            Clear Cart
        </button>
    `
}

const getEmptyCartHTML = () => {
  return `
        <div class="empty-cart animate-fade-in">
            <div class="empty-cart-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <button class="cta-button" onclick="navigateToProducts()">
                Continue Shopping
            </button>
        </div>
    `
}

const proceedToCheckout = () => {
  if (cartItems.length === 0) {
    showNotification("Your cart is empty", "warning")
    return
  }

  // Check if user is authenticated
  if (window.authManager && !window.authManager.requireAuth()) {
    return
  }

  navigateToPage("checkout")
  renderCheckoutPage()
}

const renderCheckoutPage = () => {
  const checkoutSummary = document.getElementById("checkout-summary")
  if (!checkoutSummary) return

  const subtotal = cartTotal
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const formattedSubtotal = window.Utils ? window.Utils.formatCurrency(subtotal) : `$${subtotal.toFixed(2)}`
  const formattedTax = window.Utils ? window.Utils.formatCurrency(tax) : `$${tax.toFixed(2)}`
  const formattedTotal = window.Utils ? window.Utils.formatCurrency(total) : `$${total.toFixed(2)}`

  checkoutSummary.innerHTML = `
        <div class="checkout-items">
            ${cartItems
              .map((item) => {
                const itemTotal = window.Utils
                  ? window.Utils.formatCurrency(item.price * item.quantity)
                  : `$${(item.price * item.quantity).toFixed(2)}`
                return `
                <div class="checkout-item">
                    <img src="${item.imageUrl || "/placeholder.svg?height=50&width=50"}" 
                         alt="${item.name}" 
                         class="checkout-item-image">
                    <div class="checkout-item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">Qty: ${item.quantity}</span>
                    </div>
                    <span class="item-price">${itemTotal}</span>
                </div>
                `
              })
              .join("")}
        </div>
        <div class="checkout-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formattedSubtotal}</span>
            </div>
            <div class="total-row">
                <span>Tax:</span>
                <span>${formattedTax}</span>
            </div>
            <div class="total-row total-final">
                <span>Total:</span>
                <span>${formattedTotal}</span>
            </div>
        </div>
    `
}

const saveCart = () => {
  if (userId) {
    saveUserCart()
  } else {
    saveCartToStorage()
  }
}

// Get cart data for checkout
const getCartData = () => {
  return {
    items: cartItems,
    subtotal: cartTotal,
    tax: cartTotal * 0.08,
    total: cartTotal * 1.08,
    itemCount: cartItemCount,
  }
}

// Helper functions
const navigateToPage = (pageId) => {
  if (window.app) {
    window.app.navigateToPage(pageId)
  }
}

const navigateToProducts = () => {
  navigateToPage("products")
}

const showNotification = (message, type) => {
  if (window.app) {
    window.app.showNotification(message, type)
  }
}

// Global functions for HTML onclick handlers
const updateCartQuantity = (productId, quantity) => {
  updateQuantity(productId, quantity)
}

const removeCartItem = (productId) => {
  removeItem(productId)
}

const clearCartItems = () => {
  clearCart()
}

// Cart manager object
const cartManager = {
  init: initCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  getCartData,
  renderCartPage,
  renderCheckoutPage,
  getItems: () => cartItems,
  getTotal: () => cartTotal,
  getItemCount: () => cartItemCount,
}

// Make available globally
window.cartManager = cartManager
window.addToCart = addItem
window.loadUserCart = loadUserCart
window.updateCartQuantity = updateCartQuantity
window.removeCartItem = removeCartItem
window.clearCartItems = clearCart
window.proceedToCheckout = proceedToCheckout
window.navigateToProducts = navigateToProducts
