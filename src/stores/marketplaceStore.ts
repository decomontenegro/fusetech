import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MarketplaceItem {
  id: string
  name: string
  description: string
  category: 'supplements' | 'equipment' | 'apparel' | 'services' | 'experiences'
  price: number // in FUSE tokens
  originalPrice?: number // in USD for reference
  discount?: number // percentage
  image: string
  brand: string
  rating: number
  reviews: number
  inStock: boolean
  featured: boolean
  tags: string[]
  specifications?: Record<string, string>
}

export interface Purchase {
  id: string
  itemId: string
  quantity: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  purchasedAt: number
  deliveryAddress?: string
  trackingCode?: string
}

export interface CartItem {
  itemId: string
  quantity: number
}

export interface Wishlist {
  itemIds: string[]
}

interface MarketplaceState {
  // Catalog
  items: MarketplaceItem[]
  categories: string[]
  featuredItems: string[]
  
  // User Shopping
  cart: CartItem[]
  wishlist: Wishlist
  purchases: Purchase[]
  
  // Filters & Search
  searchQuery: string
  selectedCategory: string | null
  priceRange: [number, number]
  sortBy: 'price' | 'rating' | 'newest' | 'popular'
  
  // Actions
  addToCart: (itemId: string, quantity?: number) => void
  removeFromCart: (itemId: string) => void
  updateCartQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  
  addToWishlist: (itemId: string) => void
  removeFromWishlist: (itemId: string) => void
  
  purchaseCart: (deliveryAddress?: string) => Promise<boolean>
  
  setSearchQuery: (query: string) => void
  setCategory: (category: string | null) => void
  setPriceRange: (range: [number, number]) => void
  setSortBy: (sort: 'price' | 'rating' | 'newest' | 'popular') => void
  
  getFilteredItems: () => MarketplaceItem[]
  getCartTotal: () => number
}

// Sample marketplace items
const sampleItems: MarketplaceItem[] = [
  {
    id: 'whey_protein_1',
    name: 'Whey Protein Premium 1kg',
    description: 'Proteína de alta qualidade para recuperação muscular',
    category: 'supplements',
    price: 150,
    originalPrice: 89.99,
    discount: 15,
    image: '/images/whey-protein.jpg',
    brand: 'FitNutrition',
    rating: 4.8,
    reviews: 324,
    inStock: true,
    featured: true,
    tags: ['protein', 'muscle', 'recovery'],
    specifications: {
      'Sabor': 'Chocolate',
      'Peso': '1kg',
      'Proteína por dose': '25g',
    },
  },
  {
    id: 'running_shoes_1',
    name: 'Tênis de Corrida UltraRun',
    description: 'Tênis profissional para corridas de longa distância',
    category: 'equipment',
    price: 400,
    originalPrice: 299.99,
    image: '/images/running-shoes.jpg',
    brand: 'SportMax',
    rating: 4.6,
    reviews: 156,
    inStock: true,
    featured: true,
    tags: ['running', 'shoes', 'performance'],
    specifications: {
      'Tamanho': '42',
      'Peso': '280g',
      'Drop': '8mm',
    },
  },
  {
    id: 'gym_membership_1',
    name: 'Academia Premium - 1 Mês',
    description: 'Acesso completo à academia com personal trainer',
    category: 'services',
    price: 200,
    originalPrice: 149.99,
    image: '/images/gym-membership.jpg',
    brand: 'FitGym',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    featured: false,
    tags: ['gym', 'membership', 'training'],
  },
  {
    id: 'smartwatch_1',
    name: 'Smartwatch Fitness Pro',
    description: 'Relógio inteligente com monitoramento completo',
    category: 'equipment',
    price: 800,
    originalPrice: 599.99,
    image: '/images/smartwatch.jpg',
    brand: 'TechFit',
    rating: 4.7,
    reviews: 234,
    inStock: true,
    featured: true,
    tags: ['smartwatch', 'monitoring', 'health'],
    specifications: {
      'Bateria': '7 dias',
      'GPS': 'Sim',
      'Resistência': 'IP68',
    },
  },
  {
    id: 'yoga_mat_1',
    name: 'Tapete de Yoga Premium',
    description: 'Tapete antiderrapante para yoga e pilates',
    category: 'equipment',
    price: 80,
    originalPrice: 59.99,
    image: '/images/yoga-mat.jpg',
    brand: 'ZenFit',
    rating: 4.5,
    reviews: 67,
    inStock: true,
    featured: false,
    tags: ['yoga', 'pilates', 'mat'],
    specifications: {
      'Espessura': '6mm',
      'Material': 'TPE',
      'Tamanho': '183x61cm',
    },
  },
]

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      items: sampleItems,
      categories: ['supplements', 'equipment', 'apparel', 'services', 'experiences'],
      featuredItems: sampleItems.filter(item => item.featured).map(item => item.id),
      
      cart: [],
      wishlist: { itemIds: [] },
      purchases: [],
      
      searchQuery: '',
      selectedCategory: null,
      priceRange: [0, 1000],
      sortBy: 'popular',

      addToCart: (itemId, quantity = 1) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.itemId === itemId)
          
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.itemId === itemId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          
          return {
            cart: [...state.cart, { itemId, quantity }],
          }
        })
      },

      removeFromCart: (itemId) => {
        set((state) => ({
          cart: state.cart.filter(item => item.itemId !== itemId),
        }))
      },

      updateCartQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId)
          return
        }
        
        set((state) => ({
          cart: state.cart.map(item =>
            item.itemId === itemId
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => {
        set({ cart: [] })
      },

      addToWishlist: (itemId) => {
        set((state) => ({
          wishlist: {
            itemIds: state.wishlist.itemIds.includes(itemId)
              ? state.wishlist.itemIds
              : [...state.wishlist.itemIds, itemId],
          },
        }))
      },

      removeFromWishlist: (itemId) => {
        set((state) => ({
          wishlist: {
            itemIds: state.wishlist.itemIds.filter(id => id !== itemId),
          },
        }))
      },

      purchaseCart: async (deliveryAddress) => {
        const state = get()
        const total = state.getCartTotal()
        
        // Here you would integrate with payment processing
        // For now, we'll simulate a successful purchase
        
        const purchase: Purchase = {
          id: `purchase_${Date.now()}`,
          itemId: 'cart', // Multiple items
          quantity: state.cart.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: total,
          status: 'confirmed',
          purchasedAt: Date.now(),
          deliveryAddress,
        }
        
        set((state) => ({
          purchases: [purchase, ...state.purchases],
          cart: [],
        }))
        
        return true
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      setCategory: (category) => {
        set({ selectedCategory: category })
      },

      setPriceRange: (range) => {
        set({ priceRange: range })
      },

      setSortBy: (sort) => {
        set({ sortBy: sort })
      },

      getFilteredItems: () => {
        const state = get()
        let filtered = [...state.items]
        
        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
          )
        }
        
        // Filter by category
        if (state.selectedCategory) {
          filtered = filtered.filter(item => item.category === state.selectedCategory)
        }
        
        // Filter by price range
        filtered = filtered.filter(item =>
          item.price >= state.priceRange[0] && item.price <= state.priceRange[1]
        )
        
        // Sort
        switch (state.sortBy) {
          case 'price':
            filtered.sort((a, b) => a.price - b.price)
            break
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating)
            break
          case 'newest':
            // For demo, we'll use featured items as "newest"
            filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
            break
          case 'popular':
            filtered.sort((a, b) => b.reviews - a.reviews)
            break
        }
        
        return filtered
      },

      getCartTotal: () => {
        const state = get()
        return state.cart.reduce((total, cartItem) => {
          const item = state.items.find(item => item.id === cartItem.itemId)
          return total + (item ? item.price * cartItem.quantity : 0)
        }, 0)
      },
    }),
    {
      name: 'fusetech-marketplace',
    }
  )
)
