// Cart Manager
window.CartManager = (() => {
  let cartItems = []
  let cartTotal = 0
  let cartItemCount = 0
  let userId = null

  // Initialize cart
  function init() {
    loadCartFromStorage()
    setupEventListeners()
    updateCartUI()

    // Listen for auth changes
    window.EventBus.on("userAuthChanged", handleAuthChange)
  }

  function setupEventListeners() {
    // Cart button in header
    const cartBtn = document.getElementById("cart-btn")
    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        window.App.navigateToPage("cart")
      })
    }
  }

  function handleAuthChange(data) {
    if (data.isAuthenticated) {
      userId = data.user.uid
      loadUserCart(userId)
    } else {
      userId = null
      saveCartToStorage()
    }
  }

  async function loadUserCart(userIdParam) {
    try {
      const result = await window.FirebaseService.getCart(userIdParam)

      if (result.success && result.cart.items) {
        cartItems = result.cart.items
        calculateTotals()
        updateCartUI()
      }
    } catch (error) {
      console.error("Error loading user cart:", error)
    }
  }

  async function saveUserCart() {
    if (userId) {
      try {
        await window.FirebaseService.saveCart(userId, cartItems)
      } catch (error) {
        console.error("Error saving user cart:", error)
      }
    }
  }

  function loadCartFromStorage() {
    const storageKey = window.CONFIG.storage.cart
    const savedCart = window.Utils.storage.get(storageKey)
    if (savedCart && Array.isArray(savedCart)) {
      cartItems = savedCart
      calculateTotals()
    }
  }

  function saveCartToStorage() {
    const storageKey = window.CONFIG.storage.cart
    window.Utils.storage.set(storageKey, cartItems)
  }

  function addItem(product, quantity = 1) {
    const existingItem = cartItems.find((item) => item.id === product.id)
    const maxItems = window.CONFIG.app.maxCartItems

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
    window.App.showNotification(`${product.name} added to cart!`, "success")
  }

  function removeItem(productId) {
    cartItems = cartItems.filter((item) => item.id !== productId)
    calculateTotals()
    updateCartUI()
    saveCart()
    renderCartPage()
  }

  function updateQuantity(productId, quantity) {
    const item = cartItems.find((item) => item.id === productId)
    const maxItems = window.CONFIG.app.maxCartItems

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

  function clearCart() {
    cartItems = []
    calculateTotals()
    updateCartUI()
    saveCart()
    renderCartPage()
  }

  function calculateTotals() {
    cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  function updateCartUI() {
    const cartCountElement = document.getElementById("cart-count")
    if (cartCountElement) {
      cartCountElement.textContent = cartItemCount
      cartCountElement.style.display = cartItemCount > 0 ? "flex" : "none"
    }
  }

  function animateCartButton() {
    const cartBtn = document.getElementById("cart-btn")
    if (cartBtn) {
      cartBtn.classList.add("animate-pulse")
      setTimeout(() => {
        cartBtn.classList.remove("animate-pulse")
      }, 600)
    }
  }

  function renderCartPage() {
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
        const formattedPrice = window.Utils.formatCurrency(item.price)
        const formattedTotal = window.Utils.formatCurrency(item.price * item.quantity)

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
            <button class="quantity-btn" onclick="window.CartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="window.CartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
          <div class="item-total">
            ${formattedTotal}
          </div>
          <button class="remove-btn" onclick="window.CartManager.removeItem('${item.id}')">
            Remove
          </button>
        </div>
      `
      })
      .join("")

    // Render cart summary
    const formattedSubtotal = window.Utils.formatCurrency(cartTotal)
    const tax = cartTotal * 0.08
    const formattedTax = window.Utils.formatCurrency(tax)
    const total = cartTotal * 1.08
    const formattedTotal = window.Utils.formatCurrency(total)

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
      <button class="checkout-btn" onclick="window.CartManager.proceedToCheckout()">
        Proceed to Checkout
      </button>
      <button class="clear-cart-btn" onclick="window.CartManager.clearCart()">
        Clear Cart
      </button>
    `
  }

  function getEmptyCartHTML() {
    return `
      <div class="empty-cart animate-fade-in">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started!</p>
        <button class="cta-button" onclick="window.App.navigateToPage('products')">
          Continue Shopping
        </button>
      </div>
    `
  }

  function proceedToCheckout() {
    if (cartItems.length === 0) {
      window.App.showNotification("Your cart is empty", "warning")
      return
    }

    // Check if user is authenticated
    if (!window.AuthManager.requireAuth()) {
      return
    }

    window.App.navigateToPage("checkout")
    window.CheckoutManager.renderCheckoutPage()
  }

  function renderCheckoutPage() {
    const checkoutSummary = document.getElementById("checkout-summary")
    if (!checkoutSummary) return

    const subtotal = cartTotal
    const tax = subtotal * 0.08
    const total = subtotal + tax

    const formattedSubtotal = window.Utils.formatCurrency(subtotal)
    const formattedTax = window.Utils.formatCurrency(tax)
    const formattedTotal = window.Utils.formatCurrency(total)

    checkoutSummary.innerHTML = `
      <div class="checkout-items">
        ${cartItems
          .map((item) => {
            const itemTotal = window.Utils.formatCurrency(item.price * item.quantity)
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

  function saveCart() {
    if (userId) {
      saveUserCart()
    } else {
      saveCartToStorage()
    }
  }

  // Get cart data for checkout
  function getCartData() {
    return {
      items: cartItems,
      subtotal: cartTotal,
      tax: cartTotal * 0.08,
      total: cartTotal * 1.08,
      itemCount: cartItemCount,
    }
  }

  // Public API
  return {
    init,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartData,
    renderCartPage,
    renderCheckoutPage,
    proceedToCheckout,
    loadUserCart,
    getItems: () => cartItems,
    getTotal: () => cartTotal,
    getItemCount: () => cartItemCount,
  }
})()

console.log("✅ Cart Manager loaded")
