'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../../components/layout/AppShell';
import { PostCard, Post, PostComment } from '../../../../components/comunidade/PostCard';
import { ShareModal } from '../../../../components/social/ShareModal';
import { 
  Card, 
  CardHeader, 
  CardContent,
  CardFooter,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Textarea,
  Separator
} from '@fuseapp/ui';
import { useAuth } from '../../../../context/AuthContext';
import { 
  ArrowLeft, 
  Send, 
  Heart, 
  MessageSquare, 
  Share2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from '@fuseapp/utils';

interface PostDetailsPageProps {
  params: {
    id: string;
  };
}

export default function PostDetailsPage({ params }: PostDetailsPageProps) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Carregar post
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const response = await fetch(`/api/posts/${id}`);
        // const data = await response.json();
        
        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados
        const mockPost: Post = {
          id,
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
        };
        
        setPost(mockPost);
      } catch (error) {
        console.error('Erro ao carregar post:', error);
        toast.error('Não foi possível carregar o post. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  // Curtir post
  const handleLike = (id: string) => {
    if (!post) return;
    
    setPost({
      ...post,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      isLiked: !post.isLiked
    });
    
    // Em produção, chamar API
    // fetch(`/api/posts/${id}/like`, { method: 'POST' });
  };

  // Compartilhar post
  const handleShare = (id: string) => {
    if (!post) return;
    setShowShareModal(true);
  };

  // Ver perfil
  const handleViewProfile = (userId: string) => {
    router.push(`/comunidade/perfil/${userId}`);
  };

  // Ver atividade
  const handleViewActivity = (activityId: string) => {
    router.push(`/atividades/${activityId}`);
  };

  // Adicionar comentário
  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;
    
    setIsSubmitting(true);
    
    try {
      // Em produção, chamar API
      // const response = await fetch(`/api/posts/${id}/comments`, {
      //   method: 'POST',
      //   body: JSON.stringify({ content: commentText })
      // });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar comentário simulado
      const newComment: PostComment = {
        id: `comment_${Date.now()}`,
        author: {
          id: user?.id || 'user_current',
          name: user?.name || 'Usuário Atual',
          username: user?.username || 'usuario',
          avatar: user?.avatar
        },
        content: commentText,
        createdAt: new Date()
      };
      
      setPost({
        ...post,
        comments: [...post.comments, newComment]
      });
      
      setCommentText('');
      toast.success('Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Não foi possível adicionar o comentário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        {isLoading ? (
          <Card className="animate-pulse">
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
        ) : post ? (
          <div className="space-y-6">
            <PostCard 
              post={post}
              onLike={handleLike}
              onComment={() => {}}
              onShare={handleShare}
              onViewProfile={handleViewProfile}
              onViewActivity={handleViewActivity}
            />
            
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Comentários ({post.comments.length})</h2>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {post.comments.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                  </div>
                ) : (
                  post.comments.map(comment => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 bg-muted/30 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div 
                              className="font-medium cursor-pointer"
                              onClick={() => handleViewProfile(comment.author.id)}
                            >
                              {comment.author.name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(comment.createdAt)}
                            </div>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                      
                      <div className="pl-11">
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                          Responder
                        </Button>
                      </div>
                      
                      <Separator className="my-4" />
                    </div>
                  ))
                )}
              </CardContent>
              
              <CardFooter>
                <div className="flex items-start gap-3 w-full">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.name || 'Usuário'} />
                    <AvatarFallback>{(user?.name || 'U').charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      placeholder="Adicione um comentário..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 min-h-[80px]"
                    />
                    
                    <Button 
                      className="self-end"
                      disabled={!commentText.trim() || isSubmitting}
                      onClick={handleAddComment}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Post não encontrado.</p>
            <Button 
              variant="outline"
              onClick={() => router.push('/comunidade')}
            >
              Voltar para a comunidade
            </Button>
          </div>
        )}
      </div>
      
      {/* Modal de compartilhamento */}
      {post && showShareModal && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            type: 'activity',
            title: `Post de ${post.author.name}`,
            description: post.content,
            imageUrl: post.images?.[0],
            url: `https://fuselabs.app/comunidade/posts/${post.id}`,
            data: post.activity
          }}
        />
      )}
    </AppShell>
  );
}
