// Checkout and Payment Management
let stripe = null
let elements = null
let isProcessing = false

// Declare Stripe variable
const Stripe = window.Stripe

// Wait for dependencies to load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    initCheckout()
  }, 500)
})

// Initialize checkout
const initCheckout = () => {
  initializeStripe()
  setupCheckoutEventListeners()
}

const initializeStripe = () => {
  if (typeof Stripe !== "undefined" && window.CONFIG) {
    stripe = Stripe(window.CONFIG.stripe.publishableKey)
    elements = stripe.elements()
  }
}

const setupCheckoutEventListeners = () => {
  const checkoutForm = document.getElementById("checkout-form")
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckout)
  }
}

const handleCheckout = async (e) => {
  e.preventDefault()

  if (isProcessing) return

  // Validate form
  if (!validateCheckoutForm()) {
    return
  }

  // Check if user is authenticated
  if (window.authManager && !window.authManager.requireAuth()) {
    return
  }

  // Get cart data
  const cartData = window.cartManager ? window.cartManager.getCartData() : { items: [] }
  if (cartData.items.length === 0) {
    showNotification("Your cart is empty", "warning")
    return
  }

  isProcessing = true
  showProcessingState()

  try {
    // Collect form data
    const formData = collectFormData()

    // Create order data
    const orderData = {
      items: cartData.items,
      subtotal: cartData.subtotal,
      tax: cartData.tax,
      total: cartData.total,
      shipping: formData.shipping,
      customerEmail: window.authManager ? window.authManager.getCurrentUser().email : "guest@example.com",
      customerName: formData.shipping.name,
    }

    // Process payment
    const paymentResult = await processPayment(orderData)

    if (paymentResult.success) {
      // Create order in database
      const orderResult = await createOrder(orderData, paymentResult.paymentIntent)

      if (orderResult.success) {
        showSuccessMessage(orderResult.order)
        if (window.cartManager) {
          window.cartManager.clearCart()
        }
        navigateToProfile()
      } else {
        throw new Error("Failed to create order")
      }
    } else {
      throw new Error(paymentResult.error)
    }
  } catch (error) {
    console.error("Checkout error:", error)
    showNotification(error.message || "Payment failed. Please try again.", "error")
  } finally {
    isProcessing = false
    hideProcessingState()
  }
}

const validateCheckoutForm = () => {
  const requiredFields = ["shipping-name", "shipping-address", "shipping-city", "shipping-zip"]

  let isValid = true

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    if (field && window.Utils && !window.Utils.validate.required(field.value)) {
      showFieldError(field, "This field is required")
      isValid = false
    } else if (field) {
      clearFieldError(field)
    }
  })

  // Validate ZIP code
  const zipField = document.getElementById("shipping-zip")
  if (zipField && zipField.value && window.Utils && !window.Utils.validate.zipCode(zipField.value)) {
    showFieldError(zipField, "Please enter a valid ZIP code")
    isValid = false
  }

  return isValid
}

const showFieldError = (field, message) => {
  field.classList.add("error")

  // Remove existing error message
  const existingError = field.parentNode.querySelector(".field-error")
  if (existingError) {
    existingError.remove()
  }

  // Add new error message
  const errorElement = document.createElement("div")
  errorElement.className = "field-error"
  errorElement.textContent = message
  field.parentNode.appendChild(errorElement)
}

const clearFieldError = (field) => {
  field.classList.remove("error")
  const errorElement = field.parentNode.querySelector(".field-error")
  if (errorElement) {
    errorElement.remove()
  }
}

const collectFormData = () => {
  return {
    shipping: {
      name: document.getElementById("shipping-name")?.value || "",
      address: document.getElementById("shipping-address")?.value || "",
      city: document.getElementById("shipping-city")?.value || "",
      zip: document.getElementById("shipping-zip")?.value || "",
    },
  }
}

const processPayment = async (orderData) => {
  try {
    // For demo purposes, we'll simulate a successful payment
    // In a real app, you would integrate with Stripe or another payment processor

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate successful payment
    const paymentId = window.Utils ? window.Utils.generateId() : Date.now().toString()

    return {
      success: true,
      paymentIntent: {
        id: "pi_" + paymentId,
        amount: Math.round(orderData.total * 100), // Convert to cents
        currency: "usd",
        status: "succeeded",
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

const createOrder = async (orderData, paymentIntent) => {
  try {
    if (!window.authManager || !window.firebaseService) {
      throw new Error("Required services not available")
    }

    const user = window.authManager.getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const order = {
      ...orderData,
      paymentIntentId: paymentIntent.id,
      paymentStatus: "completed",
      orderNumber: generateOrderNumber(),
      status: "confirmed",
    }

    const result = await window.firebaseService.createOrder(user.uid, order)
    return result
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: error.message }
  }
}

const generateOrderNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  return `ORD-${timestamp.slice(-6)}${random}`
}

const showProcessingState = () => {
  const submitBtn = document.querySelector(".checkout-btn")
  if (submitBtn) {
    submitBtn.textContent = "Processing Payment..."
    submitBtn.disabled = true
    submitBtn.classList.add("loading-state")
  }
}

const hideProcessingState = () => {
  const submitBtn = document.querySelector(".checkout-btn")
  if (submitBtn) {
    submitBtn.textContent = "Proceed to Payment"
    submitBtn.disabled = false
    submitBtn.classList.remove("loading-state")
  }
}

const showSuccessMessage = (order) => {
  const modal = document.getElementById("notification-modal")
  const modalBody = document.getElementById("notification-body")

  if (modal && modalBody) {
    const formattedTotal = window.Utils ? window.Utils.formatCurrency(order.total) : `$${order.total.toFixed(2)}`

    modalBody.innerHTML = `
            <div class="success-message animate-fade-in">
                <div class="success-icon">✅</div>
                <h3>Order Confirmed!</h3>
                <p>Thank you for your purchase!</p>
                <div class="order-details">
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Total:</strong> ${formattedTotal}</p>
                </div>
                <button class="cta-button" onclick="closeSuccessModal()">
                    Continue Shopping
                </button>
            </div>
        `

    modal.classList.add("active")
  }
}

const closeSuccessModal = () => {
  const modal = document.getElementById("notification-modal")
  if (modal) {
    modal.classList.remove("active")
  }
}

const navigateToProfile = () => {
  setTimeout(() => {
    navigateToPage("profile")
  }, 3000)
}

// Helper functions
const navigateToPage = (pageId) => {
  if (window.app) {
    window.app.navigateToPage(pageId)
  }
}

const showNotification = (message, type) => {
  if (window.app) {
    window.app.showNotification(message, type)
  }
}

// Checkout manager object
const checkoutManager = {
  init: initCheckout,
  handleCheckout,
  validateCheckoutForm,
  processPayment,
  createOrder,
}

// Make available globally
window.checkoutManager = checkoutManager
window.closeSuccessModal = closeSuccessModal
