'use client'

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Zap, Award, Filter, Search, ArrowLeft } from 'lucide-react';
import { products, Product, getProductsByCategory, getFeaturedProducts } from '@/data/products';

export default function LojaPage() {
  const [user, setUser] = useState<any>(null);
  const [userTokens, setUserTokens] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchTerm]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      if (userData.authenticated) {
        setUser(userData.user);
        // Buscar tokens do usuário
        const tokensResponse = await fetch('/api/user/tokens');
        const tokensData = await tokensResponse.json();
        setUserTokens(tokensData.totalTokens || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = getProductsByCategory(selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handlePurchase = async (product: Product) => {
    if (userTokens < product.tokens) {
      alert('Tokens insuficientes! Continue se exercitando para ganhar mais tokens.');
      return;
    }

    const confirmed = confirm(
      `Confirma a troca de ${product.tokens} tokens por ${product.name}?\n\nVocê tem ${userTokens} tokens disponíveis.`
    );

    if (confirmed) {
      try {
        const response = await fetch('/api/loja/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, tokens: product.tokens })
        });

        if (response.ok) {
          alert('🎉 Parabéns! Produto adquirido com sucesso!\n\nEntraremos em contato para entrega.');
          setUserTokens(prev => prev - product.tokens);
        } else {
          alert('Erro ao processar compra. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro na compra:', error);
        alert('Erro ao processar compra. Tente novamente.');
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bronze': return 'from-amber-400 to-orange-500';
      case 'prata': return 'from-gray-400 to-gray-600';
      case 'ouro': return 'from-yellow-400 to-yellow-600';
      case 'diamante': return 'from-blue-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bronze': return '🥉';
      case 'prata': return '🥈';
      case 'ouro': return '🥇';
      case 'diamante': return '💎';
      default: return '⭐';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Faça login para acessar a loja</h1>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Loja FuseLabs
                </h1>
                <p className="text-sm text-gray-500">Troque tokens por produtos reais</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-lg font-bold text-green-600">{userTokens.toLocaleString()} tokens</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Todos
              </button>
              {['bronze', 'prata', 'ouro', 'diamante'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === category
                      ? `bg-gradient-to-r ${getCategoryColor(category)} text-white`
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {getCategoryIcon(category)}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
              {/* Badge de Categoria */}
              <div className={`h-2 bg-gradient-to-r ${getCategoryColor(product.category)}`}></div>
              
              {/* Imagem do Produto */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-6xl">{getCategoryIcon(product.category)}</div>
              </div>

              <div className="p-6">
                {/* Nome e Preço */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">{product.tokens.toLocaleString()} tokens</span>
                    <span className="text-sm text-gray-500">R$ {product.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Benefícios */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {product.benefits.slice(0, 2).map((benefit, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botão de Compra */}
                <button
                  onClick={() => handlePurchase(product)}
                  disabled={userTokens < product.tokens || !product.inStock}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    userTokens >= product.tokens && product.inStock
                      ? `bg-gradient-to-r ${getCategoryColor(product.category)} text-white hover:shadow-lg transform hover:scale-105`
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!product.inStock ? 'Esgotado' : 
                   userTokens < product.tokens ? 'Tokens insuficientes' : 
                   'Trocar por tokens'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
