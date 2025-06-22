// Product Manager
window.ProductManager = (() => {
  let products = []
  let filteredProducts = []
  let categories = []
  let currentCategory = ""
  let currentSort = "name"
  let searchQuery = ""

  // Initialize products
  function init() {
    setupEventListeners()
    loadProducts()
  }

  function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("search-input")
    const searchBtn = document.getElementById("search-btn")

    if (searchInput) {
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
      shopNowBtn.addEventListener("click", () => {
        window.App.navigateToPage("products")
      })
    }
  }

  async function loadProducts() {
    try {
      // Show loading state
      showLoadingState()

      const result = await window.FirebaseService.getProducts(50)

      if (result.success) {
        products = result.products
        filteredProducts = [...products]
        extractCategories()
        renderProducts()
        renderFeaturedProducts()
        populateCategoryFilter()
      } else {
        window.App.showNotification("Failed to load products", "error")
      }
    } catch (error) {
      console.error("Error loading products:", error)
      window.App.showNotification("An error occurred while loading products", "error")
    }
  }

  function extractCategories() {
    const categorySet = new Set()
    products.forEach((product) => {
      if (product.category) {
        categorySet.add(product.category)
      }
    })
    categories = Array.from(categorySet).sort()
  }

  function populateCategoryFilter() {
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

  function handleSearch(query) {
    searchQuery = query.toLowerCase()
    applyFilters()

    // Navigate to products page if not already there
    if (query && window.App.getCurrentPage() !== "products") {
      window.App.navigateToPage("products")
    }
  }

  function handleCategoryFilter(category) {
    currentCategory = category
    applyFilters()
  }

  function handleSort(sortType) {
    currentSort = sortType
    applyFilters()
  }

  function applyFilters() {
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

  function renderProducts() {
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

  function renderFeaturedProducts() {
    const container = document.getElementById("featured-products")
    if (!container) return

    // Get featured products
    const featuredProducts = products.filter((p) => p.featured).slice(0, 8)
    container.innerHTML = ""

    featuredProducts.forEach((product, index) => {
      const productCard = createProductCard(product)
      productCard.classList.add("stagger-item")
      productCard.style.animationDelay = `${index * 0.1}s`
      container.appendChild(productCard)
    })
  }

  function createProductCard(product) {
    const card = document.createElement("div")
    card.className = "product-card hover-lift"

    const formattedPrice = window.Utils.formatCurrency(product.price)

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
      window.CartManager.addItem(product)
    })

    return card
  }

  async function showProductDetail(productId) {
    try {
      const result = await window.FirebaseService.getProduct(productId)

      if (result.success) {
        renderProductDetail(result.product)
        window.App.navigateToPage("product-detail")
      } else {
        window.App.showNotification("Product not found", "error")
      }
    } catch (error) {
      console.error("Error loading product details:", error)
      window.App.showNotification("Failed to load product details", "error")
    }
  }

  function renderProductDetail(product) {
    const container = document.getElementById("product-detail-container")
    if (!container) return

    const formattedPrice = window.Utils.formatCurrency(product.price)

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

  function setupQuantityControls(product) {
    const decreaseBtn = document.getElementById("decrease-qty")
    const increaseBtn = document.getElementById("increase-qty")
    const qtyDisplay = document.getElementById("product-qty")
    const addToCartBtn = document.getElementById("add-to-cart-detail")

    let quantity = 1
    const maxItems = window.CONFIG.app.maxCartItems

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
        window.CartManager.addItem(product, quantity)
      })
    }
  }

  function showLoadingState() {
    const containers = ["all-products", "featured-products"]

    containers.forEach((containerId) => {
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = getLoadingHTML()
      }
    })
  }

  function getLoadingHTML() {
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

  function getNoProductsHTML() {
    return `
      <div class="no-products">
        <div class="no-products-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
        <button class="cta-button" onclick="window.ProductManager.clearFilters()">
          Clear Filters
        </button>
      </div>
    `
  }

  function clearFilters() {
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

  // Public API
  return {
    init,
    loadProducts,
    clearFilters,
    getProducts: () => products,
    getFilteredProducts: () => filteredProducts,
  }
})()

console.log("✅ Product Manager loaded")
