import { DriverLayout } from '@/components/driver/DriverLayout';
import { useDriverDeliveryHistory } from '@/hooks/useDriverData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function DriverHistory() {
  const { data: history, isLoading } = useDriverDeliveryHistory();

  const groupedByDate = history?.reduce((acc, order) => {
    const date = order.delivered_at 
      ? format(new Date(order.delivered_at), 'yyyy-MM-dd')
      : 'unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {} as Record<string, typeof history>);

  const sortedDates = Object.keys(groupedByDate || {}).sort((a, b) => b.localeCompare(a));

  return (
    <DriverLayout title="Histórico de Entregas">
      <div className="space-y-6">
        <p className="text-muted-foreground">Veja suas entregas concluídas</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : history?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma entrega concluída</h3>
              <p className="text-muted-foreground text-center">
                Suas entregas finalizadas aparecerão aqui
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => {
              const orders = groupedByDate?.[dateKey] || [];
              const displayDate = dateKey !== 'unknown' 
                ? format(new Date(dateKey), "EEEE, dd 'de' MMMM", { locale: ptBR })
                : 'Data desconhecida';

              const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

              return (
                <Card key={dateKey}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base capitalize">{displayDate}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        {orders.length} {orders.length === 1 ? 'entrega' : 'entregas'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Total: {formatCurrency(totalRevenue)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-accent" />
                            <div>
                              <p className="font-medium">Pedido #{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.delivered_at && format(
                                  new Date(order.delivered_at), 
                                  'HH:mm', 
                                  { locale: ptBR }
                                )}
                                {' • '}
                                {order.order_items?.length || 0} itens
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">{formatCurrency(Number(order.total))}</p>
                        </div>
                      ))}
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
