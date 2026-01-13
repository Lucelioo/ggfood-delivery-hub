import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewCard from '@/components/ReviewCard';
import { useAllPublicReviews } from '@/hooks/usePublicReviews';

const Reviews = () => {
  const { data: reviews, isLoading } = useAllPublicReviews();

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews?.filter((r) => r.rating === rating).length || 0,
    percentage: reviews && reviews.length > 0
      ? ((reviews.filter((r) => r.rating === rating).length / reviews.length) * 100)
      : 0,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Avaliações dos Clientes</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Star className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Nenhuma avaliação ainda</h2>
              <p className="text-muted-foreground mb-6">
                Seja o primeiro a avaliar!
              </p>
              <Link to="/cardapio">
                <Button variant="hero" size="lg">
                  Fazer um pedido
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Summary Card */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {averageRating}
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(Number(averageRating))
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-transparent text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {ratingCounts.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-3">{rating}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="lg:col-span-3">
                <div className="grid md:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      name={review.profile?.name || 'Cliente'}
                      avatarUrl={review.profile?.avatar_url}
                      rating={review.rating}
                      comment={review.comment || 'Sem comentário'}
                      createdAt={review.created_at}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reviews;
