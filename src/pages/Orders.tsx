import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-500' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'text-blue-500' },
  preparing: { label: 'Preparando', icon: Package, color: 'text-orange-500' },
  ready: { label: 'Pronto', icon: CheckCircle, color: 'text-green-500' },
  delivering: { label: 'A caminho', icon: Truck, color: 'text-primary' },
  delivered: { label: 'Entregue', icon: CheckCircle, color: 'text-accent' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-destructive' },
};

const Orders = () => {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Faça login para ver seus pedidos</h2>
            <p className="text-muted-foreground mb-6">
              Entre na sua conta para acompanhar seus pedidos
            </p>
            <Link to="/login">
              <Button variant="hero" size="lg">
                Entrar
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            <h1 className="text-2xl md:text-3xl font-bold">Meus Pedidos</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !orders || orders.length === 0 ? (
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
              {orders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = status.icon;
                const orderItems = order.order_items || [];

                return (
                  <div
                    key={order.id}
                    className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pedido #{order.order_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "dd MMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{status.label}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      {orderItems.map((item) => (
                        <p key={item.id} className="text-sm">
                          {item.quantity}x {item.product_name}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <p className="font-bold text-lg">
                        R$ {Number(order.total).toFixed(2).replace('.', ',')}
                      </p>
                      {order.status === 'delivering' && order.estimated_delivery && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <MapPin className="w-4 h-4" />
                          <span>
                            Previsão: {format(new Date(order.estimated_delivery), "HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      {order.status === 'delivered' && order.delivered_at && (
                        <div className="flex items-center gap-2 text-sm text-accent">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Entregue às {format(new Date(order.delivered_at), "HH:mm", { locale: ptBR })}
                          </span>
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
