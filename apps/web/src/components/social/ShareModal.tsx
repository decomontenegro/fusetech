import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Textarea,
  Switch,
  Label
} from '@fuseapp/ui';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Copy, 
  CheckCircle,
  Image,
  MapPin,
  Tag,
  Users,
  Award,
  Trophy,
  Clock,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos de conteúdo para compartilhar
export type ShareContentType = 
  | 'activity' 
  | 'achievement' 
  | 'challenge' 
  | 'profile' 
  | 'milestone';

interface ShareContent {
  type: ShareContentType;
  title: string;
  description: string;
  imageUrl?: string;
  data?: Record<string, any>;
  url: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareContent;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  content
}) => {
  const [activeTab, setActiveTab] = useState('social');
  const [message, setMessage] = useState('');
  const [includeImage, setIncludeImage] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [includeTags, setIncludeTags] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Gerar mensagem padrão com base no tipo de conteúdo
  React.useEffect(() => {
    let defaultMessage = '';
    
    switch (content.type) {
      case 'activity':
        defaultMessage = `Acabei de completar ${content.data?.distance}km em ${content.data?.duration} no FuseLabs! 💪 #FuseLabs #Fitness`;
        break;
      case 'achievement':
        defaultMessage = `Acabei de desbloquear a conquista "${content.title}" no FuseLabs! 🏆 #FuseLabs #Achievement`;
        break;
      case 'challenge':
        defaultMessage = `Completei o desafio "${content.title}" no FuseLabs! 🎯 #FuseLabs #Challenge`;
        break;
      case 'milestone':
        defaultMessage = `Atingi um novo marco: ${content.title} no FuseLabs! 🚀 #FuseLabs #Milestone`;
        break;
      default:
        defaultMessage = `Confira isso no FuseLabs! ${content.title} #FuseLabs`;
    }
    
    setMessage(defaultMessage);
  }, [content]);

  // Copiar link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(content.url);
    setLinkCopied(true);
    toast.success('Link copiado para a área de transferência!');
    
    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  // Compartilhar nas redes sociais
  const handleShare = (platform: string) => {
    setIsSharing(true);
    
    // Em produção, integrar com APIs das redes sociais
    // Simulação
    setTimeout(() => {
      toast.success(`Compartilhado com sucesso no ${platform}!`);
      setIsSharing(false);
      onClose();
    }, 1500);
  };

  // Renderizar ícone com base no tipo de conteúdo
  const renderContentIcon = () => {
    switch (content.type) {
      case 'activity':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'challenge':
        return <Trophy className="h-5 w-5 text-purple-500" />;
      case 'profile':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'milestone':
        return <Calendar className="h-5 w-5 text-red-500" />;
      default:
        return <Share2 className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {renderContentIcon()}
            Compartilhar {content.title}
          </DialogTitle>
          <DialogDescription>
            Compartilhe sua conquista com amigos e nas redes sociais.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="social" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="link">Copiar Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea 
                id="message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compartilhe uma mensagem..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="include-image" className="text-sm">
                    Incluir imagem
                  </Label>
                </div>
                <Switch 
                  id="include-image" 
                  checked={includeImage} 
                  onCheckedChange={setIncludeImage} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="include-location" className="text-sm">
                    Incluir localização
                  </Label>
                </div>
                <Switch 
                  id="include-location" 
                  checked={includeLocation} 
                  onCheckedChange={setIncludeLocation} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="include-tags" className="text-sm">
                    Incluir hashtags
                  </Label>
                </div>
                <Switch 
                  id="include-tags" 
                  checked={includeTags} 
                  onCheckedChange={setIncludeTags} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleShare('Facebook')}
                disabled={isSharing}
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleShare('Twitter')}
                disabled={isSharing}
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                Twitter
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleShare('Instagram')}
                disabled={isSharing}
              >
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleShare('LinkedIn')}
                disabled={isSharing}
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                LinkedIn
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="share-link">Link para compartilhar</Label>
              <div className="flex gap-2">
                <Input 
                  id="share-link" 
                  value={content.url} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {linkCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Compartilhe este link com seus amigos para que eles possam ver sua {
                  content.type === 'activity' ? 'atividade' :
                  content.type === 'achievement' ? 'conquista' :
                  content.type === 'challenge' ? 'desafio' :
                  content.type === 'milestone' ? 'marco' : 'conquista'
                }.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {activeTab === 'social' && (
            <Button 
              onClick={() => handleShare('Todas as redes')}
              disabled={isSharing}
            >
              {isSharing ? 'Compartilhando...' : 'Compartilhar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
