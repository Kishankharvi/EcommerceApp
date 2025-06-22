// Checkout Manager
window.CheckoutManager = (() => {
  let stripe = null
  let isProcessing = false

  // Initialize checkout
  function init() {
    initializeStripe()
    setupEventListeners()
  }

  function initializeStripe() {
    if (window.CONFIG.stripe.publishableKey) {
      stripe = window.Stripe(window.CONFIG.stripe.publishableKey)
    }
  }

  function setupEventListeners() {
    const checkoutForm = document.getElementById("checkout-form")
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", handleCheckout)
    }
  }

  async function handleCheckout(e) {
    e.preventDefault()

    if (isProcessing) return

    // Validate form
    if (!validateCheckoutForm()) {
      return
    }

    // Check if user is authenticated
    if (!window.AuthManager.requireAuth()) {
      return
    }

    // Get cart data
    const cartData = window.CartManager.getCartData()
    if (cartData.items.length === 0) {
      window.App.showNotification("Your cart is empty", "warning")
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
        customerEmail: window.AuthManager.getCurrentUser().email,
        customerName: formData.shipping.name,
      }

      // Process payment
      const paymentResult = await processPayment(orderData)

      if (paymentResult.success) {
        // Create order in database
        const orderResult = await createOrder(orderData, paymentResult.paymentIntent)

        if (orderResult.success) {
          showSuccessMessage(orderResult.order)
          window.CartManager.clearCart()
          setTimeout(() => {
            window.App.navigateToPage("profile")
          }, 3000)
        } else {
          throw new Error("Failed to create order")
        }
      } else {
        throw new Error(paymentResult.error)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      window.App.showNotification(error.message || "Payment failed. Please try again.", "error")
    } finally {
      isProcessing = false
      hideProcessingState()
    }
  }

  function validateCheckoutForm() {
    const requiredFields = ["shipping-name", "shipping-address", "shipping-city", "shipping-zip"]
    let isValid = true

    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId)
      if (field && !window.Utils.validate.required(field.value)) {
        showFieldError(field, "This field is required")
        isValid = false
      } else if (field) {
        clearFieldError(field)
      }
    })

    // Validate ZIP code
    const zipField = document.getElementById("shipping-zip")
    if (zipField && zipField.value && !window.Utils.validate.zipCode(zipField.value)) {
      showFieldError(zipField, "Please enter a valid ZIP code")
      isValid = false
    }

    return isValid
  }

  function showFieldError(field, message) {
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

  function clearFieldError(field) {
    field.classList.remove("error")
    const errorElement = field.parentNode.querySelector(".field-error")
    if (errorElement) {
      errorElement.remove()
    }
  }

  function collectFormData() {
    return {
      shipping: {
        name: document.getElementById("shipping-name")?.value || "",
        address: document.getElementById("shipping-address")?.value || "",
        city: document.getElementById("shipping-city")?.value || "",
        zip: document.getElementById("shipping-zip")?.value || "",
      },
    }
  }

  async function processPayment(orderData) {
    try {
      // For demo purposes, simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const paymentId = window.Utils.generateId()

      return {
        success: true,
        paymentIntent: {
          id: "pi_" + paymentId,
          amount: Math.round(orderData.total * 100),
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

  async function createOrder(orderData, paymentIntent) {
    try {
      const user = window.AuthManager.getCurrentUser()
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

      const result = await window.FirebaseService.createOrder(user.uid, order)
      return result
    } catch (error) {
      console.error("Error creating order:", error)
      return { success: false, error: error.message }
    }
  }

  function generateOrderNumber() {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 5).toUpperCase()
    return `ORD-${timestamp.slice(-6)}${random}`
  }

  function showProcessingState() {
    const submitBtn = document.querySelector(".checkout-btn")
    if (submitBtn) {
      submitBtn.textContent = "Processing Payment..."
      submitBtn.disabled = true
      submitBtn.classList.add("loading-state")
    }
  }

  function hideProcessingState() {
    const submitBtn = document.querySelector(".checkout-btn")
    if (submitBtn) {
      submitBtn.textContent = "Proceed to Payment"
      submitBtn.disabled = false
      submitBtn.classList.remove("loading-state")
    }
  }

  function showSuccessMessage(order) {
    const modal = document.getElementById("notification-modal")
    const modalBody = document.getElementById("notification-body")

    if (modal && modalBody) {
      const formattedTotal = window.Utils.formatCurrency(order.total)

      modalBody.innerHTML = `
        <div class="success-message animate-fade-in">
          <div class="success-icon">✅</div>
          <h3>Order Confirmed!</h3>
          <p>Thank you for your purchase!</p>
          <div class="order-details">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Total:</strong> ${formattedTotal}</p>
          </div>
          <button class="cta-button" onclick="window.CheckoutManager.closeSuccessModal()">
            Continue Shopping
          </button>
        </div>
      `

      modal.classList.add("active")
    }
  }

  function closeSuccessModal() {
    const modal = document.getElementById("notification-modal")
    if (modal) {
      modal.classList.remove("active")
    }
  }

  function renderCheckoutPage() {
    window.CartManager.renderCheckoutPage()
  }

  // Public API
  return {
    init,
    handleCheckout,
    renderCheckoutPage,
    closeSuccessModal,
  }
})()

console.log("✅ Checkout Manager loaded")
