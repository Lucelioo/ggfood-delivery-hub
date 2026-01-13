import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          className={cn(
            'transition-colors',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors',
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
