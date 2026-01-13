import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin, Loader2, XCircle, ThumbsUp, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useOrders, useConfirmOrderReceipt, useCancelOrder } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

// Customer view: Aguardando Confirmação → Em Preparo → Em Rota → Pedido Entregue
const statusConfig = {
  pending: { label: 'Aguardando Confirmação', icon: Clock, color: 'text-yellow-500' },
  confirmed: { label: 'Pedido Confirmado', icon: CheckCircle, color: 'text-blue-500' },
  preparing: { label: 'Em Preparo', icon: Package, color: 'text-orange-500' },
  ready: { label: 'Pronto para Envio', icon: CheckCircle, color: 'text-green-500' },
  delivering: { label: 'Em Rota', icon: Truck, color: 'text-primary' },
  delivered: { label: 'Pedido Entregue', icon: CheckCircle, color: 'text-accent' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-destructive' },
};

const Orders = () => {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const confirmReceipt = useConfirmOrderReceipt();
  const cancelOrder = useCancelOrder();
  const { toast } = useToast();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleConfirmClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setConfirmDialogOpen(true);
  };

  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelDialogOpen(true);
  };

  const handleConfirmReceipt = async () => {
    if (!selectedOrderId) return;

    try {
      await confirmReceipt.mutateAsync(selectedOrderId);
      toast({
        title: 'Recebimento confirmado!',
        description: 'Obrigado por confirmar o recebimento do seu pedido.',
      });
      setConfirmDialogOpen(false);
      setSelectedOrderId(null);
    } catch (error) {
      toast({
        title: 'Erro ao confirmar',
        description: 'Não foi possível confirmar o recebimento. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;

    try {
      await cancelOrder.mutateAsync(selectedOrderId);
      toast({
        title: 'Pedido cancelado',
        description: 'Seu pedido foi cancelado com sucesso.',
      });
      setCancelDialogOpen(false);
      setSelectedOrderId(null);
    } catch (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar o pedido. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

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
                const isDelivered = order.status === 'delivered';
                const isConfirmed = !!(order as any).customer_confirmed_at;

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
                      <div className="flex items-center gap-3">
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCancelClick(order.id)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Ban className="w-4 h-4" />
                            Cancelar
                          </Button>
                        )}
                        {order.status === 'delivering' && order.estimated_delivery && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <MapPin className="w-4 h-4" />
                            <span>
                              Previsão: {format(new Date(order.estimated_delivery), "HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                        {isDelivered && !isConfirmed && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleConfirmClick(order.id)}
                            className="gap-2"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Confirmar Recebimento
                          </Button>
                        )}
                        {isDelivered && isConfirmed && (
                          <div className="flex items-center gap-2 text-sm text-accent">
                            <CheckCircle className="w-4 h-4" />
                            <span>Recebimento confirmado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
            <DialogDescription>
              Você confirma que recebeu seu pedido em perfeitas condições?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmReceipt} 
              disabled={confirmReceipt.isPending}
              className="gap-2"
            >
              {confirmReceipt.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Pedido</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelOrder} 
              disabled={cancelOrder.isPending}
              className="gap-2"
            >
              {cancelOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Cancelar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
