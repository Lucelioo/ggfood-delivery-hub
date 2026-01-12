import { ArrowRight, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <span className="animate-pulse-soft">🔥</span>
              <span>Promoções especiais hoje!</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in">
              Sua comida favorita
              <br />
              <span className="text-gradient">na sua porta</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Hambúrgueres artesanais, pizzas deliciosas e muito mais. 
              Peça agora e receba em minutos!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button variant="hero" size="xl">
                Ver cardápio
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                Como funciona?
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Entrega Grátis</p>
                  <p className="text-muted-foreground text-xs">Acima de R$ 50</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Entrega Rápida</p>
                  <p className="text-muted-foreground text-xs">30-45 minutos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-20 scale-95" />
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=500&fit=crop"
                alt="Hambúrguer delicioso"
                className="relative rounded-3xl shadow-elevated w-full max-w-md mx-auto animate-float"
              />
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-card p-4 animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">4.9</p>
                    <p className="text-xs text-muted-foreground">+2000 avaliações</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
