# NeoShop - Futuristic eCommerce Web Application

![NeoShop Logo](https://img.shields.io/badge/NeoShop-Futuristic%20eCommerce-00ffff?style=for-the-badge&logo=shopping-cart)

A cutting-edge eCommerce web application built with modern web technologies, featuring a futuristic glassmorphism design, real-time functionality, and progressive web app capabilities.

#(https://ecommerceappsee.netlify.app/) 🚀 Live Demo

Open with VS Code Live Server for instant preview!

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Code Architecture](#-code-architecture)
- [Data Flow](#-data-flow)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🛒 **Core eCommerce Features**
- Product catalog with search and filtering
- Shopping cart with real-time updates
- Secure checkout process
- Order management and tracking
- User authentication and profiles
- Wishlist functionality

### 🎨 **Modern UI/UX**
- Futuristic glassmorphism design
- Smooth animations and transitions
- Responsive design for all devices
- Dark theme with neon accents
- Interactive hover effects
- Loading states and micro-interactions

### 🔧 **Technical Features**
- Progressive Web App (PWA)
- Offline functionality
- Real-time data synchronization
- Local storage persistence
- Service worker caching
- Cross-browser compatibility

## 🛠 Tech Stack

### **Frontend**
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with custom properties
- **Vanilla JavaScript (ES6+)** - Core functionality and interactions
- **Web APIs** - Local Storage, Service Worker, Intersection Observer

### **Backend & Database**
- **Firebase Authentication** - User management and security
- **Cloud Firestore** - NoSQL document database
- **Firebase Storage** - File and image storage
- **Firebase Hosting** - Web hosting and deployment

### **Payment Processing**
- **Stripe** - Secure payment processing
- **Stripe Elements** - Customizable payment forms

### **Development Tools**
- **VS Code Live Server** - Development server
- **Git** - Version control
- **Chrome DevTools** - Debugging and optimization

## 📁 Project Structure

\`\`\`
neoshop/
├── 📄 index.html                 # Main HTML file
├── 📄 manifest.json             # PWA manifest
├── 📄 sw.js                     # Service worker
├── 📄 README.md                 # Project documentation
├── 📁 css/
│   ├── 🎨 styles.css            # Main stylesheet
│   └── ✨ animations.css        # Animation definitions
├── 📁 js/
│   ├── ⚙️ config.js             # App configuration
│   ├── 🔥 firebase-service.js   # Firebase integration
│   ├── 🛠 utils.js              # Utility functions
│   ├── 🔐 auth-manager.js       # Authentication logic
│   ├── 📦 product-manager.js    # Product management
│   ├── 🛒 cart-manager.js       # Shopping cart logic
│   ├── 💳 checkout-manager.js   # Checkout process
│   ├── 👤 profile-manager.js    # User profile management
│   └── 🚀 app.js               # Main application controller
└── 📁 assets/
    ├── 🖼 images/               # Product images and assets
    └── 🎵 sounds/               # UI sound effects
\`\`\`

## 🗄 Database Schema

### **Firestore Collections**

#### 👥 **users**
\`\`\`javascript
{
  id: "user_uid",                    // Document ID (Firebase Auth UID)
  displayName: "John Doe",           // User's full name
  email: "john@example.com",         // Email address
  photoURL: "https://...",           // Profile picture URL
  createdAt: Timestamp,              // Account creation date
  updatedAt: Timestamp,              // Last profile update
  preferences: {                     // User preferences
    emailNotifications: true,
    marketingEmails: false,
    theme: "dark"
  },
  address: {                         // Default shipping address
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  }
}
\`\`\`

#### 📦 **products**
\`\`\`javascript
{
  id: "product_id",                  // Auto-generated document ID
  name: "Quantum Smartphone X1",    // Product name
  description: "Next-gen...",        // Product description
  price: 1299.99,                   // Price in USD
  category: "Electronics",          // Product category
  imageUrl: "https://...",          // Main product image
  images: [                         // Additional product images
    "https://image1.jpg",
    "https://image2.jpg"
  ],
  inStock: true,                    // Availability status
  stockQuantity: 50,                // Available quantity
  featured: true,                   // Featured product flag
  tags: ["smartphone", "tech"],     // Search tags
  specifications: {                 // Product specifications
    brand: "NeoTech",
    model: "X1",
    color: "Space Gray",
    weight: "180g"
  },
  ratings: {                        // Product ratings
    average: 4.5,
    count: 128
  },
  createdAt: Timestamp,             // Product creation date
  updatedAt: Timestamp              // Last update date
}
\`\`\`

#### 🛒 **carts**
\`\`\`javascript
{
  id: "user_uid",                   // Document ID (User's UID)
  items: [                          // Cart items array
    {
      id: "product_id",             // Product reference
      name: "Product Name",         // Product name (cached)
      price: 99.99,                // Product price (cached)
      quantity: 2,                 // Quantity in cart
      imageUrl: "https://...",     // Product image (cached)
      addedAt: Timestamp           // When added to cart
    }
  ],
  updatedAt: Timestamp,            // Last cart update
  totalItems: 3,                   // Total item count
  totalAmount: 299.97              // Total cart value
}
\`\`\`

#### 📋 **orders**
\`\`\`javascript
{
  id: "order_id",                   // Auto-generated document ID
  orderNumber: "ORD-123456",        // Human-readable order number
  userId: "user_uid",               // Customer reference
  customerEmail: "john@example.com", // Customer email
  customerName: "John Doe",         // Customer name
  status: "confirmed",              // Order status
  items: [                          // Ordered items
    {
      id: "product_id",
      name: "Product Name",
      price: 99.99,
      quantity: 2,
      imageUrl: "https://..."
    }
  ],
  pricing: {                        // Order pricing breakdown
    subtotal: 199.98,
    tax: 15.99,
    shipping: 0.00,
    total: 215.97
  },
  shipping: {                       // Shipping information
    name: "John Doe",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  payment: {                        // Payment information
    method: "stripe",
    paymentIntentId: "pi_...",
    status: "completed",
    amount: 215.97
  },
  tracking: {                       // Order tracking
    carrier: "UPS",
    trackingNumber: "1Z999AA1...",
    estimatedDelivery: Timestamp
  },
  createdAt: Timestamp,             // Order creation date
  updatedAt: Timestamp              // Last status update
}
\`\`\`

#### ⭐ **reviews**
\`\`\`javascript
{
  id: "review_id",                  // Auto-generated document ID
  productId: "product_id",          // Product reference
  userId: "user_uid",               // Reviewer reference
  userName: "John Doe",             // Reviewer name
  rating: 5,                        // Rating (1-5 stars)
  title: "Amazing product!",        // Review title
  comment: "This product...",       // Review text
  verified: true,                   // Verified purchase
  helpful: 12,                      // Helpful votes
  images: [                         // Review images
    "https://review1.jpg"
  ],
  createdAt: Timestamp,             // Review date
  updatedAt: Timestamp              // Last edit date
}
\`\`\`

#### ❤️ **wishlists**
\`\`\`javascript
{
  id: "user_uid",                   // Document ID (User's UID)
  items: [                          // Wishlist items
    {
      productId: "product_id",      // Product reference
      addedAt: Timestamp            // When added to wishlist
    }
  ],
  updatedAt: Timestamp              // Last update
}
\`\`\`

## 🚀 Installation

### **Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- VS Code with Live Server extension
- Git (optional)

### **Quick Start**

1. **Clone or Download**
   \`\`\`bash
   git clone https://github.com/yourusername/neoshop.git
   cd neoshop
   \`\`\`

2. **Open in VS Code**
   \`\`\`bash
   code .
   \`\`\`

3. **Start Live Server**
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - App opens at `http://localhost:5500`

### **Firebase Setup (Optional)**

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow setup wizard

2. **Enable Services**
   \`\`\`bash
   # Enable Authentication
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google

   # Create Firestore Database
   - Go to Firestore Database
   - Create database in test mode

   # Enable Storage
   - Go to Storage
   - Get started with default rules
   \`\`\`

3. **Get Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy Firebase config object

4. **Update Config**
   \`\`\`javascript
   // js/config.js
   const CONFIG = {
     firebase: {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
     }
   }
   \`\`\`

## ⚙️ Configuration

### **Environment Variables**
\`\`\`javascript
// js/config.js
const CONFIG = {
  // Firebase Configuration
  firebase: {
    apiKey: "your-firebase-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  },

  // Stripe Configuration
  stripe: {
    publishableKey: "pk_test_your_stripe_key"
  },

  // App Settings
  app: {
    name: "NeoShop",
    version: "1.0.0",
    currency: "USD",
    itemsPerPage: 12,
    maxCartItems: 99
  }
}
\`\`\`

### **Customization Options**
\`\`\`css
/* css/styles.css - Color Scheme */
:root {
  --primary-cyan: #00ffff;      /* Primary brand color */
  --primary-purple: #8a2be2;    /* Secondary brand color */
  --primary-pink: #ff1493;      /* Accent color */
  --bg-primary: #0a0a0a;        /* Background color */
  --text-primary: #ffffff;      /* Text color */
}
\`\`\`

## 🏗 Code Architecture

### **Modular Design Pattern**

The application follows a modular architecture with clear separation of concerns:

\`\`\`javascript
// Module Pattern Example
window.ModuleName = (() => {
  // Private variables and functions
  let privateVar = 'private'
  
  function privateFunction() {
    // Private logic
  }
  
  // Public API
  return {
    publicMethod: () => {
      // Public logic
    },
    init: () => {
      // Initialization
    }
  }
})()
\`\`\`

### **Core Modules**

#### 🚀 **App.js** - Main Controller
- Application initialization
- Route management
- Global state management
- Event coordination

#### 🔐 **Auth Manager** - Authentication
- User login/logout
- Registration handling
- Session management
- Auth state changes

#### 📦 **Product Manager** - Product Operations
- Product loading and display
- Search and filtering
- Category management
- Product details

#### 🛒 **Cart Manager** - Shopping Cart
- Add/remove items
- Quantity updates
- Cart persistence
- Total calculations

#### 💳 **Checkout Manager** - Order Processing
- Form validation
- Payment processing
- Order creation
- Success handling

#### 👤 **Profile Manager** - User Profile
- Profile display
- Order history
- Settings management
- Account updates

### **Event-Driven Architecture**

\`\`\`javascript
// Event Bus Pattern
window.EventBus = {
  on: (event, callback) => { /* Subscribe */ },
  emit: (event, data) => { /* Publish */ },
  off: (event, callback) => { /* Unsubscribe */ }
}

// Usage Example
EventBus.on('userLoggedIn', (user) => {
  CartManager.loadUserCart(user.uid)
  ProfileManager.loadUserProfile(user)
})

EventBus.emit('userLoggedIn', userData)
\`\`\`

## 🔄 Data Flow

### **Application Lifecycle**

```mermaid
graph TD
    A[App Initialization] --> B[Load Configuration]
    B --> C[Initialize Firebase]
    C --> D[Setup Event Listeners]
    D --> E[Initialize Managers]
    E --> F[Load Sample Data]
    F --> G[Render UI]
    G --> H[App Ready]
