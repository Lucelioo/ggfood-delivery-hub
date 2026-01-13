import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Mock data for demonstration
const mockOrders = [
  {
    id: '1',
    items: ['2x Smash Burger Clássico', '1x Refrigerante 350ml'],
    total: 72.70,
    status: 'delivering',
    createdAt: new Date(),
    estimatedDelivery: '35 min',
  },
  {
    id: '2',
    items: ['1x Pizza Margherita', '1x Suco Natural 500ml'],
    total: 62.80,
    status: 'delivered',
    createdAt: new Date(Date.now() - 86400000),
    estimatedDelivery: null,
  },
];

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-500' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'text-blue-500' },
  preparing: { label: 'Preparando', icon: Package, color: 'text-orange-500' },
  delivering: { label: 'A caminho', icon: Truck, color: 'text-primary' },
  delivered: { label: 'Entregue', icon: CheckCircle, color: 'text-accent' },
};

const Orders = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Meus Pedidos</h1>
          </div>

          {mockOrders.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Nenhum pedido ainda</h2>
              <p className="text-muted-foreground mb-6">
                Faça seu primeiro pedido e ele aparecerá aqui!
              </p>
              <Link to="/cardapio">
                <Button variant="hero" size="lg">
                  Ver cardápio
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {mockOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={order.id}
                    className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pedido #{order.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{status.label}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <p className="font-bold text-lg">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </p>
                      {order.status === 'delivering' && order.estimatedDelivery && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <MapPin className="w-4 h-4" />
                          <span>Chegando em ~{order.estimatedDelivery}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
