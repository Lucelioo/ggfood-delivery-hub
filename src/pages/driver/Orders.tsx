import { DriverLayout } from '@/components/driver/DriverLayout';
import { useDriverOrders, useUpdateDeliveryStatus } from '@/hooks/useDriverData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle,
  Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
    ready: { label: 'Pronto para Retirar', variant: 'secondary' },
    delivering: { label: 'Em Entrega', variant: 'default' },
  };
  const { label, variant } = variants[status] || { label: status, variant: 'secondary' };
  return <Badge variant={variant}>{label}</Badge>;
};

export default function DriverOrders() {
  const { data: orders, isLoading } = useDriverOrders();
  const updateStatus = useUpdateDeliveryStatus();
  const { toast } = useToast();

  const handleStartDelivery = async (orderId: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: 'delivering' });
      toast({ title: 'Entrega iniciada!', description: 'O cliente foi notificado' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar status', variant: 'destructive' });
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: 'delivered' });
      toast({ title: 'Entrega concluída!', description: 'Parabéns pela entrega' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar status', variant: 'destructive' });
    }
  };

  const openMaps = (address: Record<string, string>) => {
    const query = encodeURIComponent(
      `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <DriverLayout title="Pedidos Ativos">
      <div className="space-y-4">
        <p className="text-muted-foreground">Gerencie suas entregas em andamento</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pedido ativo</h3>
              <p className="text-muted-foreground text-center">
                Quando um pedido for atribuído a você, ele aparecerá aqui
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => {
              const address = order.delivery_address as Record<string, string> | null;
              
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Pedido #{order.order_number}
                          {getStatusBadge(order.status || '')}
                        </CardTitle>
                        <CardDescription>
                          {order.profile?.name || 'Cliente'}
                        </CardDescription>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(Number(order.total))}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="flex items-center gap-4">
                      {order.profile?.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${order.profile.phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            Ligar
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Delivery Address */}
                    {address && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">
                                {address.street}, {address.number}
                                {address.complement && ` - ${address.complement}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.neighborhood}, {address.city}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                CEP: {address.zip_code}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => openMaps(address)}>
                            <Navigation className="h-4 w-4 mr-2" />
                            Navegar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Itens do Pedido:</p>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items?.map((item) => (
                          <p key={item.id}>
                            {item.quantity}x {item.product_name}
                            {item.notes && <span className="text-xs"> ({item.notes})</span>}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="p-3 rounded-lg bg-primary/10 text-sm">
                        <p className="font-medium">Observações:</p>
                        <p>{order.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {order.status === 'ready' && (
                        <Button 
                          className="flex-1" 
                          onClick={() => handleStartDelivery(order.id)}
                          disabled={updateStatus.isPending}
                        >
                          {updateStatus.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <Navigation className="h-4 w-4 mr-2" />
                          Iniciar Entrega
                        </Button>
                      )}
                      {order.status === 'delivering' && (
                        <Button 
                          className="flex-1 bg-accent hover:bg-accent/90" 
                          onClick={() => handleCompleteDelivery(order.id)}
                          disabled={updateStatus.isPending}
                        >
                          {updateStatus.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmar Entrega
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DriverLayout>
  );
}
