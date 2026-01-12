import { DriverLayout } from '@/components/driver/DriverLayout';
import { useDriverProfile, useDriverOrders, useDriverDeliveryHistory } from '@/hooks/useDriverData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, CheckCircle, Clock, MapPin } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function DriverDashboard() {
  const { data: profile, isLoading: profileLoading } = useDriverProfile();
  const { data: activeOrders, isLoading: ordersLoading } = useDriverOrders();
  const { data: history } = useDriverDeliveryHistory();

  const todayDeliveries = history?.filter(order => {
    const deliveredAt = order.delivered_at ? new Date(order.delivered_at) : null;
    if (!deliveredAt) return false;
    const today = new Date();
    return deliveredAt.toDateString() === today.toDateString();
  }) || [];

  return (
    <DriverLayout title="Minhas Entregas">
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👋 Olá, {profileLoading ? <Skeleton className="h-6 w-32" /> : profile?.name || 'Entregador'}!
            </CardTitle>
            <CardDescription>
              {profile?.is_available 
                ? 'Você está online e pronto para entregas'
                : 'Ative seu status para receber pedidos'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entregas Ativas</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders?.length || 0}</div>
              <p className="text-xs text-muted-foreground">pedidos para entregar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entregas Hoje</CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayDeliveries.length}</div>
              <p className="text-xs text-muted-foreground">concluídas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Histórico</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history?.length || 0}</div>
              <p className="text-xs text-muted-foreground">entregas realizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Entregas Pendentes
            </CardTitle>
            <CardDescription>Seus pedidos ativos para entrega</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activeOrders?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma entrega pendente no momento</p>
                <p className="text-sm mt-1">Novos pedidos aparecerão aqui quando atribuídos a você</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders?.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Pedido #{order.order_number}</p>
                        <Badge variant={order.status === 'delivering' ? 'default' : 'secondary'}>
                          {order.status === 'delivering' ? 'Em entrega' : 'Pronto para retirar'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.profile?.name || 'Cliente'} • {order.profile?.phone}
                      </p>
                      {order.delivery_address && (
                        <p className="text-sm text-muted-foreground">
                          📍 {(order.delivery_address as Record<string, string>).street}, {(order.delivery_address as Record<string, string>).number}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">{formatCurrency(Number(order.total))}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DriverLayout>
  );
}
