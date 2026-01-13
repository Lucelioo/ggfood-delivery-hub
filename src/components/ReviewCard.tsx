import { Star, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReviewCardProps {
  name: string;
  avatarUrl?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

const ReviewCard = ({ name, avatarUrl, rating, comment, createdAt }: ReviewCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl || undefined} alt={name} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{name}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(createdAt), "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-muted-foreground'
            }`}
          />
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
        "{comment}"
      </p>
    </div>
  );
};

export default ReviewCard;
