// Product Management
let products = []
let filteredProducts = []
let categories = []
let currentCategory = ""
let currentSort = "name"
let searchQuery = ""

// Wait for dependencies to load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    initProducts()
  }, 300)
})

// Initialize products
const initProducts = () => {
  setupProductEventListeners()
  loadProducts()
}

const setupProductEventListeners = () => {
  // Search functionality
  const searchInput = document.getElementById("search-input")
  const searchBtn = document.getElementById("search-btn")

  if (searchInput && window.Utils) {
    searchInput.addEventListener(
      "input",
      window.Utils.debounce((e) => {
        handleSearch(e.target.value)
      }, 300),
    )
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput ? searchInput.value : ""
      handleSearch(query)
    })
  }

  // Filter and sort
  const categoryFilter = document.getElementById("category-filter")
  const sortFilter = document.getElementById("sort-filter")

  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      handleCategoryFilter(e.target.value)
    })
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", (e) => {
      handleSort(e.target.value)
    })
  }

  // Shop now button
  const shopNowBtn = document.getElementById("shop-now-btn")
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", navigateToProducts)
  }
}

const loadProducts = async () => {
  try {
    // Show loading state
    showLoadingState()

    // Check if firebaseService is available
    if (!window.firebaseService) {
      console.error("Firebase service not available")
      showError("Failed to load products - service unavailable")
      return
    }

    const result = await window.firebaseService.getProducts(50)

    if (result.success) {
      products = result.products
      filteredProducts = [...products]
      extractCategories()
      renderProducts()
      renderFeaturedProducts()
      populateCategoryFilter()
    } else {
      showError("Failed to load products")
    }
  } catch (error) {
    console.error("Error loading products:", error)
    showError("An error occurred while loading products")
  }
}

const extractCategories = () => {
  const categorySet = new Set()
  products.forEach((product) => {
    if (product.category) {
      categorySet.add(product.category)
    }
  })
  categories = Array.from(categorySet).sort()
}

const populateCategoryFilter = () => {
  const categoryFilter = document.getElementById("category-filter")
  if (categoryFilter) {
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="">All Categories</option>'

    categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category
      option.textContent = category
      categoryFilter.appendChild(option)
    })
  }
}

const handleSearch = (query) => {
  searchQuery = query.toLowerCase()
  applyFilters()

  // Navigate to products page if not already there
  if (query && window.app && window.app.getCurrentPage() !== "products") {
    navigateToProducts()
  }
}

const handleCategoryFilter = (category) => {
  currentCategory = category
  applyFilters()
}

const handleSort = (sortType) => {
  currentSort = sortType
  applyFilters()
}

const applyFilters = () => {
  let filtered = [...products]

  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        (product.category && product.category.toLowerCase().includes(searchQuery)),
    )
  }

  // Apply category filter
  if (currentCategory) {
    filtered = filtered.filter((product) => product.category === currentCategory)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (currentSort) {
      case "name":
        return a.name.localeCompare(b.name)
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      default:
        return 0
    }
  })

  filteredProducts = filtered
  renderProducts()
}

const renderProducts = () => {
  const container = document.getElementById("all-products")
  if (!container) return

  if (filteredProducts.length === 0) {
    container.innerHTML = getNoProductsHTML()
    return
  }

  container.innerHTML = ""

  filteredProducts.forEach((product, index) => {
    const productCard = createProductCard(product)
    productCard.classList.add("stagger-item")
    productCard.style.animationDelay = `${index * 0.1}s`
    container.appendChild(productCard)
  })
}

const renderFeaturedProducts = () => {
  const container = document.getElementById("featured-products")
  if (!container) return

  // Get first 8 products as featured
  const featuredProducts = products.slice(0, 8)
  container.innerHTML = ""

  featuredProducts.forEach((product, index) => {
    const productCard = createProductCard(product)
    productCard.classList.add("stagger-item")
    productCard.style.animationDelay = `${index * 0.1}s`
    container.appendChild(productCard)
  })
}

const createProductCard = (product) => {
  const card = document.createElement("div")
  card.className = "product-card hover-lift"

  const formattedPrice = window.Utils ? window.Utils.formatCurrency(product.price) : `$${product.price}`

  card.innerHTML = `
        <img src="${product.imageUrl || "/placeholder.svg?height=200&width=280"}" 
             alt="${product.name}" 
             class="product-image"
             loading="lazy">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description || ""}</p>
        <div class="product-price">${formattedPrice}</div>
        <button class="add-to-cart-btn btn-ripple" data-product-id="${product.id}">
            Add to Cart
        </button>
    `

  // Add click event for product details
  card.addEventListener("click", (e) => {
    if (!e.target.classList.contains("add-to-cart-btn")) {
      showProductDetail(product.id)
    }
  })

  // Add to cart functionality
  const addToCartBtn = card.querySelector(".add-to-cart-btn")
  addToCartBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    addToCart(product)
  })

  return card
}

const showProductDetail = async (productId) => {
  try {
    if (!window.firebaseService) {
      showError("Service unavailable")
      return
    }

    const result = await window.firebaseService.getProduct(productId)

    if (result.success) {
      renderProductDetail(result.product)
      navigateToPage("product-detail")
    } else {
      showError("Product not found")
    }
  } catch (error) {
    console.error("Error loading product details:", error)
    showError("Failed to load product details")
  }
}

const renderProductDetail = (product) => {
  const container = document.getElementById("product-detail-container")
  if (!container) return

  const formattedPrice = window.Utils ? window.Utils.formatCurrency(product.price) : `$${product.price}`

  container.innerHTML = `
        <div class="product-detail animate-fade-in">
            <div class="product-detail-image">
                <img src="${product.imageUrl || "/placeholder.svg?height=400&width=400"}" 
                     alt="${product.name}" 
                     class="detail-image">
            </div>
            <div class="product-detail-info">
                <h1 class="detail-title">${product.name}</h1>
                <div class="detail-price">${formattedPrice}</div>
                <div class="detail-description">
                    <p>${product.description || "No description available."}</p>
                </div>
                <div class="detail-category">
                    <span class="category-tag">${product.category || "Uncategorized"}</span>
                </div>
                <div class="detail-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" id="decrease-qty">-</button>
                        <span class="quantity-display" id="product-qty">1</span>
                        <button class="quantity-btn" id="increase-qty">+</button>
                    </div>
                    <button class="add-to-cart-btn large" id="add-to-cart-detail">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `

  // Set up quantity controls
  setupQuantityControls(product)
}

const setupQuantityControls = (product) => {
  const decreaseBtn = document.getElementById("decrease-qty")
  const increaseBtn = document.getElementById("increase-qty")
  const qtyDisplay = document.getElementById("product-qty")
  const addToCartBtn = document.getElementById("add-to-cart-detail")

  let quantity = 1
  const maxItems = window.CONFIG ? window.CONFIG.app.maxCartItems : 99

  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", () => {
      if (quantity > 1) {
        quantity--
        if (qtyDisplay) qtyDisplay.textContent = quantity
      }
    })
  }

  if (increaseBtn) {
    increaseBtn.addEventListener("click", () => {
      if (quantity < maxItems) {
        quantity++
        if (qtyDisplay) qtyDisplay.textContent = quantity
      }
    })
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      addToCart(product, quantity)
    })
  }
}

const addToCart = (product, quantity = 1) => {
  if (window.addToCart) {
    window.addToCart(product, quantity)
    showNotification(`${product.name} added to cart!`, "success")
  }
}

const showLoadingState = () => {
  const containers = ["all-products", "featured-products"]

  containers.forEach((containerId) => {
    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = getLoadingHTML()
    }
  })
}

const getLoadingHTML = () => {
  return `
        <div class="loading-products">
            ${Array(8)
              .fill()
              .map(
                () => `
                <div class="product-card skeleton">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-description"></div>
                    <div class="skeleton-price"></div>
                    <div class="skeleton-button"></div>
                </div>
            `,
              )
              .join("")}
        </div>
    `
}

const getNoProductsHTML = () => {
  return `
        <div class="no-products">
            <div class="no-products-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button class="cta-button" onclick="clearFilters()">
                Clear Filters
            </button>
        </div>
    `
}

const clearFilters = () => {
  searchQuery = ""
  currentCategory = ""
  currentSort = "name"

  // Reset UI
  const searchInput = document.getElementById("search-input")
  const categoryFilter = document.getElementById("category-filter")
  const sortFilter = document.getElementById("sort-filter")

  if (searchInput) searchInput.value = ""
  if (categoryFilter) categoryFilter.value = ""
  if (sortFilter) sortFilter.value = "name"

  applyFilters()
}

const navigateToProducts = () => {
  navigateToPage("products")
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

const showError = (message) => {
  showNotification(message, "error")
}

// Product manager object
const productManager = {
  init: initProducts,
  loadProducts,
  clearFilters,
  getProducts: () => products,
  getFilteredProducts: () => filteredProducts,
}

// Make available globally
window.productManager = productManager
window.clearFilters = clearFilters
