import React, { useState, useRef } from 'react';
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
import { 
  Image, 
  MapPin, 
  Award, 
  Smile, 
  X,
  Camera,
  Plus
} from 'lucide-react';
import { PostActivity } from './PostCard';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface CreatePostCardProps {
  user: User;
  onSubmit: (content: string, images: File[], activity?: PostActivity) => Promise<void>;
  recentActivities?: PostActivity[];
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  user,
  onSubmit,
  recentActivities = []
}) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<PostActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipular seleção de imagens
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Limitar a 10 imagens
      if (images.length + newFiles.length > 10) {
        alert('Você pode adicionar no máximo 10 imagens.');
        return;
      }
      
      setImages([...images, ...newFiles]);
      
      // Criar previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagesPreviews([...imagesPreviews, ...newPreviews]);
    }
  };

  // Remover imagem
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagesPreviews];
    
    // Revogar URL do objeto para evitar vazamento de memória
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagesPreviews(newPreviews);
  };

  // Selecionar atividade
  const handleSelectActivity = (activity: PostActivity) => {
    setSelectedActivity(activity);
    setShowActivities(false);
  };

  // Remover atividade
  const handleRemoveActivity = () => {
    setSelectedActivity(null);
  };

  // Enviar post
  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0 && !selectedActivity) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(content, images, selectedActivity || undefined);
      setContent('');
      setImages([]);
      setImagesPreviews([]);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Erro ao criar post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar tipo de atividade
  const formatActivityType = (type: string) => {
    switch (type) {
      case 'run':
        return 'Corrida';
      case 'cycle':
        return 'Pedalada';
      case 'walk':
        return 'Caminhada';
      default:
        return 'Atividade';
    }
  };

  // Formatar distância
  const formatDistance = (meters: number | undefined) => {
    if (meters === undefined) return '';
    return (meters / 1000).toFixed(2) + ' km';
  };

  // Formatar duração
  const formatDuration = (seconds: number | undefined) => {
    if (seconds === undefined) return '';
    
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

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">@{user.username}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-3">
        <Textarea
          placeholder="O que você está pensando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] border-0 focus-visible:ring-0 p-0 placeholder:text-muted-foreground resize-none"
        />
        
        {imagesPreviews.length > 0 && (
          <div className={`grid gap-2 mt-3 ${
            imagesPreviews.length === 1 ? 'grid-cols-1' : 
            imagesPreviews.length === 2 ? 'grid-cols-2' : 
            'grid-cols-3'
          }`}>
            {imagesPreviews.map((preview, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden bg-muted" style={{ aspectRatio: '1/1' }}>
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {selectedActivity && (
          <div className="bg-muted/50 rounded-lg p-3 mt-3 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-1 right-1 h-6 w-6 rounded-full"
              onClick={handleRemoveActivity}
            >
              <X className="h-3 w-3" />
            </Button>
            
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {formatActivityType(selectedActivity.type)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {selectedActivity.distance !== undefined && (
                <div>
                  <span className="text-muted-foreground">Distância</span>
                  <p className="font-medium">{formatDistance(selectedActivity.distance)}</p>
                </div>
              )}
              
              {selectedActivity.duration !== undefined && (
                <div>
                  <span className="text-muted-foreground">Tempo</span>
                  <p className="font-medium">{formatDuration(selectedActivity.duration)}</p>
                </div>
              )}
            </div>
            
            {selectedActivity.location && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{selectedActivity.location}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="px-4 py-3 flex justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-5 w-5 text-muted-foreground" />
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleImageSelect}
            />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowActivities(!showActivities)}
          >
            <Award className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={(!content.trim() && images.length === 0 && !selectedActivity) || isSubmitting}
        >
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </Button>
      </CardFooter>
      
      {/* Seletor de atividades recentes */}
      {showActivities && recentActivities.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-sm font-medium mb-2">Atividades recentes</p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className="bg-muted/50 rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSelectActivity(activity)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">
                    {formatActivityType(activity.type)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                  {activity.distance !== undefined && (
                    <span>{formatDistance(activity.distance)}</span>
                  )}
                  
                  {activity.duration !== undefined && (
                    <span>{formatDuration(activity.duration)}</span>
                  )}
                  
                  {activity.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
