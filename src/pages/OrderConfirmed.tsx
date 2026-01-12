import { Link } from 'react-router-dom';
import { CheckCircle, Home, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const OrderConfirmed = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto max-w-lg text-center">
          <div className="animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-accent" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Pedido Confirmado!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Seu pedido foi recebido e está sendo preparado com carinho.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <Clock className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Previsão</p>
                  <p className="font-semibold">30-45 min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <MapPin className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold">Preparando</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/pedidos">
              <Button variant="hero" size="lg" className="w-full">
                Acompanhar Pedido
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmed;
