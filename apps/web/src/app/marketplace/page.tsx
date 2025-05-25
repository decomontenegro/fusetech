'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingBag, Zap, Star, Filter, Search, Tag, Gift } from 'lucide-react'

export default function MarketplacePage() {
  const [mounted, setMounted] = useState(false)
  const [category, setCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <p className="text-gray-700 font-semibold">Carregando Marketplace...</p>
        </div>
      </div>
    )
  }

  const mockProducts = [
    {
      id: 1,
      name: 'Tênis de Corrida Nike Air',
      description: 'Tênis profissional para corrida com tecnologia Air Max',
      price: 500,
      originalPrice: 650,
      category: 'equipamentos',
      rating: 4.8,
      reviews: 124,
      image: '👟',
      discount: 23,
      inStock: true
    },
    {
      id: 2,
      name: 'Smartwatch Garmin',
      description: 'Monitor de atividades com GPS e frequência cardíaca',
      price: 800,
      originalPrice: 1000,
      category: 'tecnologia',
      rating: 4.9,
      reviews: 89,
      image: '⌚',
      discount: 20,
      inStock: true
    },
    {
      id: 3,
      name: 'Garrafa Térmica Premium',
      description: 'Garrafa de aço inoxidável que mantém a temperatura por 24h',
      price: 150,
      originalPrice: 200,
      category: 'acessorios',
      rating: 4.7,
      reviews: 256,
      image: '🍶',
      discount: 25,
      inStock: true
    },
    {
      id: 4,
      name: 'Suplemento Whey Protein',
      description: 'Proteína isolada para recuperação muscular pós-treino',
      price: 200,
      originalPrice: 250,
      category: 'suplementos',
      rating: 4.6,
      reviews: 178,
      image: '🥤',
      discount: 20,
      inStock: false
    },
    {
      id: 5,
      name: 'Bicicleta Speed Profissional',
      description: 'Bicicleta de alta performance para ciclismo urbano',
      price: 2500,
      originalPrice: 3000,
      category: 'equipamentos',
      rating: 4.9,
      reviews: 45,
      image: '🚴‍♂️',
      discount: 17,
      inStock: true
    },
    {
      id: 6,
      name: 'Kit Acessórios Yoga',
      description: 'Tapete, blocos e faixa elástica para prática de yoga',
      price: 120,
      originalPrice: 160,
      category: 'acessorios',
      rating: 4.5,
      reviews: 92,
      image: '🧘‍♀️',
      discount: 25,
      inStock: true
    }
  ]

  const categories = [
    { id: 'all', name: 'Todos', icon: '🛍️' },
    { id: 'equipamentos', name: 'Equipamentos', icon: '🏃‍♂️' },
    { id: 'tecnologia', name: 'Tecnologia', icon: '📱' },
    { id: 'acessorios', name: 'Acessórios', icon: '🎒' },
    { id: 'suplementos', name: 'Suplementos', icon: '💊' }
  ]

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = category === 'all' || product.category === category
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const userBalance = 1250 // Mock user FUSE balance

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                {userBalance} FUSE
              </div>
              <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-medium">Carrinho</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    category === cat.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-6xl">
                  {product.image}
                </div>
                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    -{product.discount}%
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Esgotado</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({product.reviews} avaliações)</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                    <Zap className="w-5 h-5 text-blue-600" />
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  disabled={!product.inStock || userBalance < product.price}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    !product.inStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : userBalance < product.price
                      ? 'bg-red-100 text-red-600 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {!product.inStock
                    ? 'Esgotado'
                    : userBalance < product.price
                    ? 'FUSE Insuficiente'
                    : 'Trocar por FUSE'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou termo de busca.</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white text-center">
          <Gift className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ganhe mais FUSE!</h2>
          <p className="text-blue-100 mb-4">
            Complete atividades físicas e desafios para ganhar mais tokens e trocar por produtos incríveis.
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Ver Atividades
          </button>
        </div>
      </div>
    </div>
  )
}
