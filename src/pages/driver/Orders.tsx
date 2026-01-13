import { DriverLayout } from '@/components/driver/DriverLayout';
import { useDriverOrders, useAvailableOrders, useClaimOrder, useUpdateDeliveryStatus } from '@/hooks/useDriverData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle,
  Loader2,
  HandMetal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    pending: { label: 'Aguardando Preparo', variant: 'secondary' },
    confirmed: { label: 'Aguardando Preparo', variant: 'secondary' },
    preparing: { label: 'Em Preparo', variant: 'secondary' },
    ready: { label: 'Pronto para Entrega', variant: 'default' },
    delivering: { label: 'Em Rota', variant: 'default' },
    delivered: { label: 'Pedido Entregue', variant: 'outline' },
  };
  const { label, variant } = variants[status] || { label: status, variant: 'secondary' };
  return <Badge variant={variant}>{label}</Badge>;
};

interface OrderCardProps {
  order: {
    id: string;
    order_number: number;
    status: string | null;
    total: number;
    notes: string | null;
    delivery_address: unknown;
    profile?: { name: string; phone: string | null } | null;
    order_items?: Array<{ id: string; quantity: number; product_name: string; notes: string | null }>;
  };
  isMyOrder?: boolean;
  onClaim?: (orderId: string) => void;
  onStartDelivery?: (orderId: string) => void;
  onCompleteDelivery?: (orderId: string) => void;
  isLoading?: boolean;
}

const OrderCard = ({ order, isMyOrder, onClaim, onStartDelivery, onCompleteDelivery, isLoading }: OrderCardProps) => {
  const address = order.delivery_address as Record<string, string> | null;

  const openMaps = () => {
    if (!address) return;
    const query = encodeURIComponent(
      `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <Card>
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
        {isMyOrder && order.profile?.phone && (
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${order.profile.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </a>
            </Button>
          </div>
        )}

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
              {isMyOrder && (
                <Button variant="outline" size="sm" onClick={openMaps}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Navegar
                </Button>
              )}
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
          {!isMyOrder && onClaim && (
            <Button 
              className="flex-1" 
              onClick={() => onClaim(order.id)}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <HandMetal className="h-4 w-4 mr-2" />
              Pegar Pedido
            </Button>
          )}
          {isMyOrder && order.status === 'ready' && onStartDelivery && (
            <Button 
              className="flex-1" 
              onClick={() => onStartDelivery(order.id)}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Navigation className="h-4 w-4 mr-2" />
              Iniciar Entrega
            </Button>
          )}
          {isMyOrder && order.status === 'delivering' && onCompleteDelivery && (
            <Button 
              className="flex-1 bg-accent hover:bg-accent/90" 
              onClick={() => onCompleteDelivery(order.id)}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Entrega
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function DriverOrders() {
  const { data: myOrders, isLoading: isLoadingMyOrders } = useDriverOrders();
  const { data: availableOrders, isLoading: isLoadingAvailable } = useAvailableOrders();
  const claimOrder = useClaimOrder();
  const updateStatus = useUpdateDeliveryStatus();
  const { toast } = useToast();

  const handleClaimOrder = async (orderId: string) => {
    try {
      await claimOrder.mutateAsync(orderId);
      toast({ title: 'Pedido aceito!', description: 'O pedido agora é seu' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: error instanceof Error ? error.message : 'Falha ao pegar pedido', 
        variant: 'destructive' 
      });
    }
  };

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

  return (
    <DriverLayout title="Pedidos Ativos">
      <div className="space-y-4">
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available" className="relative">
              Disponíveis
              {availableOrders && availableOrders.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {availableOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="my-orders" className="relative">
              Meus Pedidos
              {myOrders && myOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {myOrders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-4">
            <p className="text-muted-foreground mb-4">Pedidos aguardando entregador (ainda não atribuídos)</p>
            
            {isLoadingAvailable ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : availableOrders?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum pedido disponível</h3>
                  <p className="text-muted-foreground text-center">
                    Novos pedidos aparecerão aqui quando estiverem prontos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {availableOrders?.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isMyOrder={false}
                    onClaim={handleClaimOrder}
                    isLoading={claimOrder.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-orders" className="mt-4">
            <p className="text-muted-foreground mb-4">Gerencie suas entregas em andamento</p>

            {isLoadingMyOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : myOrders?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum pedido atribuído</h3>
                  <p className="text-muted-foreground text-center">
                    Pegue um pedido na aba "Disponíveis" para começar
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myOrders?.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isMyOrder={true}
                    onStartDelivery={handleStartDelivery}
                    onCompleteDelivery={handleCompleteDelivery}
                    isLoading={updateStatus.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  );
}
