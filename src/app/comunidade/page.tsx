'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PostCard, Post, PostActivity } from '../../components/comunidade/PostCard';
import { CreatePostCard } from '../../components/comunidade/CreatePostCard';
import { ShareModal } from '../../components/social/ShareModal';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input
} from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Search, 
  UserPlus, 
  MessageSquare,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ComunidadePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState<PostActivity[]>([]);

  // Carregar posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const response = await fetch('/api/posts');
        // const data = await response.json();
        
        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados
        const mockPosts: Post[] = [
          {
            id: 'post_1',
            author: {
              id: 'user_1',
              name: 'João Silva',
              username: 'joaosilva',
              avatar: '/avatars/avatar-1.jpg',
              level: 5
            },
            content: 'Acabei de completar minha primeira corrida de 10km! 🏃‍♂️💪\n\nEstou muito feliz com meu progresso nas últimas semanas. Obrigado a todos que me incentivaram!',
            images: ['/images/posts/run-1.jpg', '/images/posts/run-2.jpg'],
            activity: {
              type: 'run',
              distance: 10000,
              duration: 3600,
              pace: 360,
              elevation: 120,
              location: 'Parque Ibirapuera, São Paulo'
            },
            likes: 24,
            comments: [
              {
                id: 'comment_1',
                author: {
                  id: 'user_2',
                  name: 'Maria Santos',
                  username: 'mariasantos',
                  avatar: '/avatars/avatar-2.jpg'
                },
                content: 'Parabéns! Continue assim! 👏',
                createdAt: new Date(Date.now() - 30 * 60 * 1000)
              },
              {
                id: 'comment_2',
                author: {
                  id: 'user_3',
                  name: 'Pedro Oliveira',
                  username: 'pedrooliveira',
                  avatar: '/avatars/avatar-3.jpg'
                },
                content: 'Incrível! Qual foi seu ritmo médio?',
                createdAt: new Date(Date.now() - 15 * 60 * 1000)
              }
            ],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isLiked: true
          },
          {
            id: 'post_2',
            author: {
              id: 'user_4',
              name: 'Ana Costa',
              username: 'anacosta',
              avatar: '/avatars/avatar-4.jpg',
              level: 8
            },
            content: 'Pedalada matinal com vista para o mar. Nada melhor para começar o dia! 🚴‍♀️🌊',
            images: ['/images/posts/cycle-1.jpg'],
            activity: {
              type: 'cycle',
              distance: 25000,
              duration: 5400,
              location: 'Orla da Praia, Santos'
            },
            likes: 42,
            comments: [
              {
                id: 'comment_3',
                author: {
                  id: 'user_5',
                  name: 'Lucas Mendes',
                  username: 'lucasmendes',
                  avatar: '/avatars/avatar-5.jpg'
                },
                content: 'Que vista incrível! Preciso conhecer esse lugar.',
                createdAt: new Date(Date.now() - 45 * 60 * 1000)
              }
            ],
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
            isLiked: false
          },
          {
            id: 'post_3',
            author: {
              id: 'user_6',
              name: 'Carla Souza',
              username: 'carlasouza',
              avatar: '/avatars/avatar-6.jpg',
              level: 3
            },
            content: 'Completei o desafio de 30 dias de caminhada! 🚶‍♀️✅\nSensação de dever cumprido e muita disposição para continuar!',
            likes: 18,
            comments: [],
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            isLiked: false
          }
        ];
        
        setPosts(mockPosts);
        
        // Atividades recentes simuladas
        const mockActivities: PostActivity[] = [
          {
            type: 'run',
            distance: 5000,
            duration: 1800,
            pace: 360,
            location: 'Parque Villa-Lobos'
          },
          {
            type: 'cycle',
            distance: 15000,
            duration: 3600,
            location: 'Ciclovia Pinheiros'
          },
          {
            type: 'walk',
            distance: 3000,
            duration: 2400,
            location: 'Parque do Ibirapuera'
          }
        ];
        
        setRecentActivities(mockActivities);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        toast.error('Não foi possível carregar os posts. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  // Filtrar posts
  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      return (
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  // Curtir post
  const handleLike = (id: string) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          likes: isLiked ? post.likes + 1 : post.likes - 1,
          isLiked
        };
      }
      return post;
    }));
    
    // Em produção, chamar API
    // fetch(`/api/posts/${id}/like`, { method: 'POST' });
  };

  // Comentar post
  const handleComment = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      // Navegar para a página de detalhes do post
      router.push(`/comunidade/posts/${id}`);
    }
  };

  // Compartilhar post
  const handleShare = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      setSelectedPost(post);
      setShowShareModal(true);
    }
  };

  // Ver perfil
  const handleViewProfile = (userId: string) => {
    router.push(`/comunidade/perfil/${userId}`);
  };

  // Ver atividade
  const handleViewActivity = (activityId: string) => {
    router.push(`/atividades/${activityId}`);
  };

  // Criar post
  const handleCreatePost = async (content: string, images: File[], activity?: PostActivity) => {
    try {
      // Em produção, chamar API
      // const formData = new FormData();
      // formData.append('content', content);
      // images.forEach(image => formData.append('images', image));
      // if (activity) formData.append('activity', JSON.stringify(activity));
      // const response = await fetch('/api/posts', { method: 'POST', body: formData });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Criar post simulado
      const newPost: Post = {
        id: `post_${Date.now()}`,
        author: {
          id: user?.id || 'user_current',
          name: user?.name || 'Usuário Atual',
          username: user?.username || 'usuario',
          avatar: user?.avatar,
          level: 4
        },
        content,
        images: images.length > 0 ? ['/images/posts/placeholder.jpg'] : undefined,
        activity,
        likes: 0,
        comments: [],
        createdAt: new Date(),
        isLiked: false
      };
      
      setPosts([newPost, ...posts]);
      toast.success('Post publicado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Não foi possível publicar o post. Tente novamente.');
      throw error;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Comunidade</h1>
            <p className="text-muted-foreground">
              Compartilhe suas atividades e conecte-se com outros usuários
            </p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar posts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Tabs defaultValue="feed" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="following">Seguindo</TabsTrigger>
                <TabsTrigger value="trending">Em Alta</TabsTrigger>
              </TabsList>
              
              <CreatePostCard 
                user={{
                  id: user?.id || 'user_current',
                  name: user?.name || 'Usuário Atual',
                  username: user?.username || 'usuario',
                  avatar: user?.avatar
                }}
                onSubmit={handleCreatePost}
                recentActivities={recentActivities}
              />
              
              <div className="space-y-4 mt-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="h-3 w-16 bg-muted rounded"></div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-muted rounded"></div>
                          <div className="h-4 w-full bg-muted rounded"></div>
                          <div className="h-4 w-2/3 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredPosts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 flex flex-col items-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center mb-4">
                        Nenhum post encontrado.
                      </p>
                      {searchQuery && (
                        <Button 
                          variant="outline"
                          onClick={() => setSearchQuery('')}
                        >
                          Limpar busca
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      onViewProfile={handleViewProfile}
                      onViewActivity={handleViewActivity}
                    />
                  ))
                )}
              </div>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sugestões para seguir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Usuário {i + 1}</p>
                        <p className="text-xs text-muted-foreground">@usuario{i + 1}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Seguir
                    </Button>
                  </div>
                ))}
                
                <Button variant="link" className="w-full">
                  Ver mais
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['running', 'fitness', 'challenge'].map((tag, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">#{tag}</p>
                        <p className="text-xs text-muted-foreground">{100 - i * 20} posts</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="link" className="w-full">
                  Ver mais
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desafios Populares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Desafio 5K', 'Desafio de Ciclismo', 'Maratona Virtual'].map((challenge, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{challenge}</p>
                        <p className="text-xs text-muted-foreground">{200 - i * 50} participantes</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Participar
                    </Button>
                  </div>
                ))}
                
                <Button variant="link" className="w-full">
                  Ver mais
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Modal de compartilhamento */}
      {selectedPost && showShareModal && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            type: 'activity',
            title: `Post de ${selectedPost.author.name}`,
            description: selectedPost.content,
            imageUrl: selectedPost.images?.[0],
            url: `https://fuselabs.app/comunidade/posts/${selectedPost.id}`,
            data: selectedPost.activity
          }}
        />
      )}
    </AppShell>
  );
}
