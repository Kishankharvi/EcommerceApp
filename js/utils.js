// Utility Functions
window.Utils = (() => {
  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: window.CONFIG.app.currency,
    }).format(amount)
  }

  // Format date
  function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  // Generate unique ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Local storage helpers
  const storage = {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        console.error("Storage set error:", error)
        return false
      }
    },

    get: (key) => {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error("Storage get error:", error)
        return null
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.error("Storage remove error:", error)
        return false
      }
    },
  }

  // Validation helpers
  const validate = {
    email: (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },

    password: (password) => {
      return password && password.length >= 6
    },

    required: (value) => {
      return value && value.trim().length > 0
    },

    zipCode: (zip) => {
      const re = /^\d{5}(-\d{4})?$/
      return re.test(zip)
    },
  }

  // Animation helpers
  const animate = {
    fadeIn: (element, duration = 300) => {
      element.style.opacity = "0"
      element.style.display = "block"

      const start = performance.now()

      const fade = (timestamp) => {
        const elapsed = timestamp - start
        const progress = elapsed / duration

        if (progress < 1) {
          element.style.opacity = progress
          requestAnimationFrame(fade)
        } else {
          element.style.opacity = "1"
        }
      }

      requestAnimationFrame(fade)
    },

    fadeOut: (element, duration = 300) => {
      const start = performance.now()
      const initialOpacity = Number.parseFloat(getComputedStyle(element).opacity)

      const fade = (timestamp) => {
        const elapsed = timestamp - start
        const progress = elapsed / duration

        if (progress < 1) {
          element.style.opacity = initialOpacity * (1 - progress)
          requestAnimationFrame(fade)
        } else {
          element.style.opacity = "0"
          element.style.display = "none"
        }
      }

      requestAnimationFrame(fade)
    },

    slideUp: (element, duration = 300) => {
      element.style.transform = "translateY(20px)"
      element.style.opacity = "0"
      element.style.transition = `all ${duration}ms ease-out`

      setTimeout(() => {
        element.style.transform = "translateY(0)"
        element.style.opacity = "1"
      }, 10)
    },
  }

  // Public API
  return {
    formatCurrency,
    formatDate,
    generateId,
    debounce,
    storage,
    validate,
    animate,
  }
})()

// Event Bus for app-wide communication
window.EventBus = (() => {
  const events = {}

  return {
    on: (event, callback) => {
      if (!events[event]) {
        events[event] = []
      }
      events[event].push(callback)
    },

    off: (event, callback) => {
      if (events[event]) {
        events[event] = events[event].filter((cb) => cb !== callback)
      }
    },

    emit: (event, data) => {
      if (events[event]) {
        events[event].forEach((callback) => callback(data))
      }
    },
  }
})()

console.log("✅ Utils loaded")
