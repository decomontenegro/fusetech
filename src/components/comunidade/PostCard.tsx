import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  CardFooter,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@fuseapp/ui';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  MapPin,
  Award,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from '@fuseapp/utils';

// Tipos
export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  level?: number;
}

export interface PostActivity {
  type: 'run' | 'cycle' | 'walk' | 'other';
  distance?: number; // em metros
  duration?: number; // em segundos
  pace?: number; // em segundos por km
  elevation?: number; // em metros
  location?: string;
}

export interface PostComment {
  id: string;
  author: PostAuthor;
  content: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  images?: string[];
  activity?: PostActivity;
  likes: number;
  comments: PostComment[];
  createdAt: Date;
  isLiked?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onViewProfile: (userId: string) => void;
  onViewActivity?: (activityId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onViewProfile,
  onViewActivity
}) => {
  // Formatar duração
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    
    return `${secs}s`;
  };
  
  // Formatar ritmo
  const formatPace = (paceInSeconds: number) => {
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = paceInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };
  
  // Renderizar ícone de atividade
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'run':
        return <Award className="h-5 w-5 text-orange-500" />;
      case 'cycle':
        return <Award className="h-5 w-5 text-blue-500" />;
      case 'walk':
        return <Award className="h-5 w-5 text-green-500" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onViewProfile(post.author.id)}
          >
            <Avatar>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                @{post.author.username}
                {post.author.level && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="bg-primary/10 text-primary px-1.5 rounded-full text-[10px]">
                      Nível {post.author.level}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(post.createdAt)}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-3">
        <p className="whitespace-pre-line mb-3">{post.content}</p>
        
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 mb-3 ${
            post.images.length === 1 ? 'grid-cols-1' : 
            post.images.length === 2 ? 'grid-cols-2' : 
            post.images.length === 3 ? 'grid-cols-2' : 
            'grid-cols-2'
          }`}>
            {post.images.map((image, index) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden bg-muted ${
                  post.images!.length === 3 && index === 0 ? 'col-span-2' : ''
                } ${
                  post.images!.length > 4 && index >= 4 ? 'hidden' : ''
                }`}
                style={{ aspectRatio: '1/1' }}
              >
                <img 
                  src={image} 
                  alt={`Post image ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                {post.images!.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                    +{post.images!.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {post.activity && (
          <div 
            className="bg-muted/50 rounded-lg p-3 mb-3 cursor-pointer"
            onClick={() => onViewActivity && onViewActivity(post.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              {renderActivityIcon(post.activity.type)}
              <span className="font-medium">
                {post.activity.type === 'run' ? 'Corrida' : 
                 post.activity.type === 'cycle' ? 'Pedalada' : 
                 post.activity.type === 'walk' ? 'Caminhada' : 
                 'Atividade'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {post.activity.distance !== undefined && (
                <div>
                  <span className="text-muted-foreground">Distância</span>
                  <p className="font-medium">{(post.activity.distance / 1000).toFixed(2)} km</p>
                </div>
              )}
              
              {post.activity.duration !== undefined && (
                <div>
                  <span className="text-muted-foreground">Tempo</span>
                  <p className="font-medium">{formatDuration(post.activity.duration)}</p>
                </div>
              )}
              
              {post.activity.pace !== undefined && (
                <div>
                  <span className="text-muted-foreground">Ritmo</span>
                  <p className="font-medium">{formatPace(post.activity.pace)}</p>
                </div>
              )}
              
              {post.activity.elevation !== undefined && (
                <div>
                  <span className="text-muted-foreground">Elevação</span>
                  <p className="font-medium">{post.activity.elevation} m</p>
                </div>
              )}
            </div>
            
            {post.activity.location && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{post.activity.location}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 pt-0 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Button 
              variant={post.isLiked ? "default" : "ghost"} 
              size="sm"
              className="gap-1"
              onClick={() => onLike(post.id)}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-1"
              onClick={() => onComment(post.id)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments.length}</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onShare(post.id)}
          >
            <Share2 className="h-4 w-4 mr-1" />
            <span>Compartilhar</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
