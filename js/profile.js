// User Profile Management
let userOrders = []
let userProfile = null

// Wait for dependencies to load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    initProfile()
  }, 600)
})

// Initialize profile
const initProfile = () => {
  // Listen for auth changes when EventBus is available
  if (window.EventBus) {
    window.EventBus.on("userAuthChanged", (data) => {
      if (data.isAuthenticated) {
        loadUserProfile(data.user)
      } else {
        clearProfile()
      }
    })
  }
}

const loadUserProfile = async (user) => {
  try {
    userProfile = user

    // Load user orders
    if (window.firebaseService) {
      const ordersResult = await window.firebaseService.getUserOrders(user.uid)
      if (ordersResult.success) {
        userOrders = ordersResult.orders
      }
    }

    // Render profile if on profile page
    if (window.app && window.app.getCurrentPage() === "profile") {
      renderProfile()
    }
  } catch (error) {
    console.error("Error loading user profile:", error)
  }
}

const clearProfile = () => {
  userProfile = null
  userOrders = []
}

const renderProfile = () => {
  const container = document.getElementById("profile-content")
  if (!container || !userProfile) return

  container.innerHTML = `
        <div class="profile-layout animate-fade-in">
            <div class="profile-sidebar">
                <div class="profile-card">
                    <div class="profile-avatar">
                        <img src="${userProfile.photoURL || "/placeholder.svg?height=100&width=100"}" 
                             alt="Profile" 
                             class="avatar-image">
                    </div>
                    <h3 class="profile-name">${userProfile.displayName || "User"}</h3>
                    <p class="profile-email">${userProfile.email}</p>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-number">${userOrders.length}</span>
                            <span class="stat-label">Orders</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${calculateTotalSpent()}</span>
                            <span class="stat-label">Total Spent</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-menu">
                    <button class="menu-item active" data-tab="orders">
                        <span class="menu-icon">📦</span>
                        Order History
                    </button>
                    <button class="menu-item" data-tab="settings">
                        <span class="menu-icon">⚙️</span>
                        Account Settings
                    </button>
                    <button class="menu-item" data-tab="wishlist">
                        <span class="menu-icon">❤️</span>
                        Wishlist
                    </button>
                </div>
            </div>
            
            <div class="profile-main">
                <div class="tab-content active" id="orders-tab">
                    ${renderOrdersTab()}
                </div>
                
                <div class="tab-content" id="settings-tab">
                    ${renderSettingsTab()}
                </div>
                
                <div class="tab-content" id="wishlist-tab">
                    ${renderWishlistTab()}
                </div>
            </div>
        </div>
    `

  setupProfileEventListeners()
}

const setupProfileEventListeners = () => {
  // Tab navigation
  const menuItems = document.querySelectorAll(".menu-item")
  menuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const tabId = e.currentTarget.dataset.tab
      switchTab(tabId)
    })
  })

  // Profile update form
  const updateForm = document.getElementById("profile-update-form")
  if (updateForm) {
    updateForm.addEventListener("submit", handleProfileUpdate)
  }
}

const switchTab = (tabId) => {
  // Update menu items
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active")
  })
  const activeTab = document.querySelector(`[data-tab="${tabId}"]`)
  if (activeTab) {
    activeTab.classList.add("active")
  }

  // Update tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  const activeContent = document.getElementById(`${tabId}-tab`)
  if (activeContent) {
    activeContent.classList.add("active")
  }
}

const renderOrdersTab = () => {
  if (userOrders.length === 0) {
    return `
            <div class="empty-orders">
                <div class="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here!</p>
                <button class="cta-button" onclick="navigateToProducts()">
                    Start Shopping
                </button>
            </div>
        `
  }

  return `
        <div class="orders-header">
            <h3>Order History</h3>
            <p>Track and manage your orders</p>
        </div>
        <div class="orders-list">
            ${userOrders.map((order) => renderOrderCard(order)).join("")}
        </div>
    `
}

const renderOrderCard = (order) => {
  const statusClass = getOrderStatusClass(order.status)
  const orderDate = window.Utils
    ? window.Utils.formatDate(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt)
    : new Date(order.createdAt).toLocaleDateString()

  const formattedTotal = window.Utils ? window.Utils.formatCurrency(order.total) : `$${order.total.toFixed(2)}`

  return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h4 class="order-number">${order.orderNumber}</h4>
                    <p class="order-date">${orderDate}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge ${statusClass}">${order.status}</span>
                    <span class="order-total">${formattedTotal}</span>
                </div>
            </div>
            
            <div class="order-items">
                ${order.items
                  .slice(0, 3)
                  .map(
                    (item) => `
                    <div class="order-item">
                        <img src="${item.imageUrl || "/placeholder.svg?height=50&width=50"}" 
                             alt="${item.name}" 
                             class="item-image">
                        <div class="item-details">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">Qty: ${item.quantity}</span>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
                ${
                  order.items.length > 3
                    ? `
                    <div class="more-items">
                        +${order.items.length - 3} more items
                    </div>
                `
                    : ""
                }
            </div>
            
            <div class="order-actions">
                <button class="order-btn" onclick="viewOrderDetails('${order.id}')">
                    View Details
                </button>
                ${
                  order.status === "confirmed"
                    ? `
                    <button class="order-btn secondary" onclick="trackOrder('${order.id}')">
                        Track Order
                    </button>
                `
                    : ""
                }
            </div>
        </div>
    `
}

const renderSettingsTab = () => {
  return `
        <div class="settings-header">
            <h3>Account Settings</h3>
            <p>Manage your account information</p>
        </div>
        
        <form class="settings-form" id="profile-update-form">
            <div class="form-section">
                <h4>Personal Information</h4>
                <div class="form-group">
                    <label for="profile-name">Full Name</label>
                    <input type="text" 
                           id="profile-name" 
                           value="${userProfile.displayName || ""}" 
                           placeholder="Enter your full name">
                </div>
                <div class="form-group">
                    <label for="profile-email">Email Address</label>
                    <input type="email" 
                           id="profile-email" 
                           value="${userProfile.email || ""}" 
                           disabled>
                    <small class="form-help">Email cannot be changed</small>
                </div>
            </div>
            
            <div class="form-section">
                <h4>Preferences</h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="email-notifications" checked>
                        <span class="checkmark"></span>
                        Email notifications
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="marketing-emails">
                        <span class="checkmark"></span>
                        Marketing emails
                    </label>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="save-btn">Save Changes</button>
                <button type="button" class="danger-btn" onclick="handleDeleteAccount()">
                    Delete Account
                </button>
            </div>
        </form>
    `
}

const renderWishlistTab = () => {
  return `
        <div class="wishlist-header">
            <h3>Wishlist</h3>
            <p>Save items for later</p>
        </div>
        
        <div class="wishlist-content">
            <div class="empty-wishlist">
                <div class="empty-icon">❤️</div>
                <h4>Your wishlist is empty</h4>
                <p>Add items to your wishlist to save them for later!</p>
                <button class="cta-button" onclick="navigateToProducts()">
                    Browse Products
                </button>
            </div>
        </div>
    `
}

const handleProfileUpdate = async (e) => {
  e.preventDefault()

  const name = document.getElementById("profile-name")?.value || ""

  if (window.Utils && !window.Utils.validate.required(name)) {
    showNotification("Please enter your full name", "error")
    return
  }

  try {
    // Update Firebase Auth profile
    if (userProfile && userProfile.updateProfile) {
      await userProfile.updateProfile({
        displayName: name,
      })
    }

    // Update Firestore user document
    if (window.firebaseService) {
      const result = await window.firebaseService.updateUserDocument(userProfile.uid, {
        displayName: name,
      })

      if (result.success) {
        showNotification("Profile updated successfully!", "success")
        userProfile.displayName = name
        renderProfile()
      } else {
        throw new Error(result.error)
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    showNotification("Failed to update profile. Please try again.", "error")
  }
}

const handleDeleteAccount = () => {
  const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.")

  if (confirmed) {
    showNotification("Account deletion is not implemented in this demo", "info")
  }
}

const viewOrderDetails = (orderId) => {
  const order = userOrders.find((o) => o.id === orderId)
  if (!order) return

  const modal = document.getElementById("notification-modal")
  const modalBody = document.getElementById("notification-body")

  if (modal && modalBody) {
    const orderDate = window.Utils
      ? window.Utils.formatDate(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt)
      : new Date(order.createdAt).toLocaleDateString()
    const formattedSubtotal = window.Utils
      ? window.Utils.formatCurrency(order.subtotal)
      : `$${order.subtotal.toFixed(2)}`
    const formattedTax = window.Utils ? window.Utils.formatCurrency(order.tax) : `$${order.tax.toFixed(2)}`
    const formattedTotal = window.Utils ? window.Utils.formatCurrency(order.total) : `$${order.total.toFixed(2)}`

    modalBody.innerHTML = `
            <div class="order-details-modal">
                <h3>Order Details</h3>
                <div class="order-info">
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${getOrderStatusClass(order.status)}">${order.status}</span></p>
                </div>
                
                <div class="order-items-detail">
                    <h4>Items Ordered</h4>
                    ${order.items
                      .map((item) => {
                        const itemPrice = window.Utils
                          ? window.Utils.formatCurrency(item.price)
                          : `$${item.price.toFixed(2)}`
                        const itemTotal = window.Utils
                          ? window.Utils.formatCurrency(item.price * item.quantity)
                          : `$${(item.price * item.quantity).toFixed(2)}`
                        return `
                        <div class="item-detail">
                            <img src="${item.imageUrl || "/placeholder.svg?height=50&width=50"}" alt="${item.name}">
                            <div class="item-info">
                                <span class="item-name">${item.name}</span>
                                <span class="item-price">${itemPrice} x ${item.quantity}</span>
                            </div>
                            <span class="item-total">${itemTotal}</span>
                        </div>
                        `
                      })
                      .join("")}
                </div>
                
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${formattedSubtotal}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax:</span>
                        <span>${formattedTax}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>${formattedTotal}</span>
                    </div>
                </div>
                
                <div class="shipping-info">
                    <h4>Shipping Address</h4>
                    <p>${order.shipping.name}</p>
                    <p>${order.shipping.address}</p>
                    <p>${order.shipping.city}, ${order.shipping.zip}</p>
                </div>
            </div>
        `

    modal.classList.add("active")
  }
}

const trackOrder = (orderId) => {
  showNotification("Order tracking is not implemented in this demo", "info")
}

const getOrderStatusClass = (status) => {
  const statusClasses = {
    pending: "status-pending",
    confirmed: "status-confirmed",
    shipped: "status-shipped",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
  }

  return statusClasses[status] || "status-pending"
}

const calculateTotalSpent = () => {
  const total = userOrders.reduce((sum, order) => sum + order.total, 0)
  return window.Utils ? window.Utils.formatCurrency(total) : `$${total.toFixed(2)}`
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

// Profile manager object
const profileManager = {
  init: initProfile,
  loadUserProfile,
  renderProfile,
  getUserOrders: () => userOrders,
  getUserProfile: () => userProfile,
}

// Initialize profile when DOM is ready
// document.addEventListener("DOMContentLoaded", () => {
//   initProfile()
// })

// Make available globally
window.profileManager = profileManager
window.viewOrderDetails = viewOrderDetails
window.trackOrder = trackOrder
window.handleDeleteAccount = handleDeleteAccount
window.navigateToProducts = navigateToProducts
