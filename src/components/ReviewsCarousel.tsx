import { Link } from 'react-router-dom';
import { ArrowRight, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ReviewCard from '@/components/ReviewCard';
import { usePublicReviews } from '@/hooks/usePublicReviews';

const ReviewsCarousel = () => {
  const { data: reviews, isLoading } = usePublicReviews(8);

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
              O que nossos clientes dizem
            </h2>
            <p className="text-muted-foreground">
              Veja as avaliações de quem já experimentou
            </p>
          </div>
          <Link to="/avaliacoes" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <ReviewCard
                  name={review.profile?.name || 'Cliente'}
                  avatarUrl={review.profile?.avatar_url}
                  rating={review.rating}
                  comment={review.comment || ''}
                  createdAt={review.created_at}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>

        <Link to="/avaliacoes" className="md:hidden block mt-6">
          <Button variant="outline" className="w-full gap-2">
            Ver todas as avaliações
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
