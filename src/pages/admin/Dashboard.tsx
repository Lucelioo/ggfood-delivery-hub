import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { useDashboardStats, useAdminOrders } from '@/hooks/useAdminData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Truck, 
  Clock,
  TrendingUp 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pendente', variant: 'secondary' },
    confirmed: { label: 'Confirmado', variant: 'default' },
    preparing: { label: 'Preparando', variant: 'default' },
    ready: { label: 'Pronto', variant: 'default' },
    delivering: { label: 'Em Entrega', variant: 'default' },
    delivered: { label: 'Entregue', variant: 'outline' },
    cancelled: { label: 'Cancelado', variant: 'destructive' },
  };

  const { label, variant } = statusMap[status] || { label: status, variant: 'secondary' };
  return <Badge variant={variant}>{label}</Badge>;
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Pedidos Hoje"
                value={stats?.todayOrders || 0}
                description={`${stats?.pendingOrders || 0} pendentes`}
                icon={ShoppingCart}
              />
              <StatCard
                title="Receita Hoje"
                value={formatCurrency(stats?.todayRevenue || 0)}
                icon={DollarSign}
              />
              <StatCard
                title="Produtos Ativos"
                value={`${stats?.availableProducts || 0}/${stats?.totalProducts || 0}`}
                icon={Package}
              />
              <StatCard
                title="Entregadores"
                value={`${stats?.availableDrivers || 0}/${stats?.totalDrivers || 0}`}
                description="Disponíveis"
                icon={Truck}
              />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pedidos Recentes
              </CardTitle>
              <CardDescription>Últimos 5 pedidos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum pedido encontrado
                </p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">Pedido #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.profile?.name || 'Cliente'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(Number(order.total))}</p>
                        {getStatusBadge(order.status || 'pending')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
              <CardDescription>Visão geral das vendas</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Total</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(stats?.totalRevenue || 0)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                      <p className="text-2xl font-bold text-accent">
                        {stats?.totalOrders || 0}
                      </p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-accent" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
