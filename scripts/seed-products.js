// Script to seed sample products in Firestore
import firebase from "firebase/app"
import "firebase/firestore"

const sampleProducts = [
  {
    name: "Quantum Smartphone X1",
    description: "Next-generation smartphone with quantum processing capabilities and holographic display.",
    price: 1299.99,
    category: "Electronics",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: true,
  },
  {
    name: "Neural VR Headset",
    description: "Immersive virtual reality headset with direct neural interface technology.",
    price: 899.99,
    category: "Electronics",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: true,
  },
  {
    name: "Cyber Jacket Pro",
    description: "Smart jacket with built-in climate control and biometric monitoring.",
    price: 599.99,
    category: "Fashion",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: false,
  },
  {
    name: "Holographic Watch",
    description: "Luxury timepiece with 3D holographic display and AI assistant.",
    price: 2499.99,
    category: "Accessories",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: true,
  },
  {
    name: "Anti-Gravity Sneakers",
    description: "Revolutionary footwear with magnetic levitation technology.",
    price: 799.99,
    category: "Fashion",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: false,
    featured: false,
  },
  {
    name: "Plasma Energy Drink",
    description: "Enhanced energy drink with nano-nutrients and electrolytes.",
    price: 29.99,
    category: "Food & Beverage",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: false,
  },
  {
    name: "Quantum Laptop Ultra",
    description: "Ultra-portable laptop with quantum computing capabilities.",
    price: 3999.99,
    category: "Electronics",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: true,
  },
  {
    name: "Biometric Backpack",
    description: "Smart backpack with fingerprint lock and solar charging panel.",
    price: 299.99,
    category: "Accessories",
    imageUrl: "/placeholder.svg?height=300&width=300",
    inStock: true,
    featured: false,
  },
]

// Declare firebaseService variable before using it
const firebaseService = {
  db: firebase.firestore(), // Assuming firebase is already initialized
}

// Function to seed products (run this in browser console after Firebase is initialized)
const seedProducts = async () => {
  try {
    console.log("Starting to seed products...")

    for (const product of sampleProducts) {
      await firebaseService.db.collection("products").add({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`Added product: ${product.name}`)
    }

    console.log("All products seeded successfully!")
  } catch (error) {
    console.error("Error seeding products:", error)
  }
}

// Uncomment the line below and run in browser console to seed products
// seedProducts()
