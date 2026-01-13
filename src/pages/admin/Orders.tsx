import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminOrders, useAdminDrivers, useUpdateOrderStatus } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const statusOptions = [
  { value: 'pending', label: 'Criado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'Em Preparo' },
  { value: 'delivering', label: 'Saiu para Entrega' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const paymentMethodLabels: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    confirmed: 'default',
    preparing: 'default',
    delivering: 'default',
    delivered: 'outline',
    cancelled: 'destructive',
  };

  const label = statusOptions.find(s => s.value === status)?.label || status;
  return <Badge variant={variants[status] || 'secondary'}>{label}</Badge>;
};

export default function Orders() {
  const { data: orders, isLoading } = useAdminOrders();
  const { data: drivers } = useAdminDrivers();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<NonNullable<typeof orders>[0] | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');

  const handleOpenDetails = (order: NonNullable<typeof orders>[0]) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setSelectedDriver(order.driver_id || '');
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      await updateStatus.mutateAsync({
        id: selectedOrder.id,
        status: newStatus,
        driver_id: selectedDriver || undefined,
      });
      toast({ title: 'Sucesso', description: 'Pedido atualizado com sucesso' });
      setDetailsOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar pedido', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Pedidos">
      <div className="space-y-4">
        <p className="text-muted-foreground">Gerencie os pedidos dos clientes</p>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.profile?.name || 'Cliente'}</p>
                        <p className="text-sm text-muted-foreground">{order.profile?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{formatCurrency(Number(order.total))}</TableCell>
                    <TableCell>{paymentMethodLabels[order.payment_method] || order.payment_method}</TableCell>
                    <TableCell>{getStatusBadge(order.status || 'pending')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDetails(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pedido #{selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              {selectedOrder && format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Cliente</h4>
                <p>{selectedOrder.profile?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.profile?.email}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.profile?.phone}</p>
              </div>

              {/* Delivery Address */}
              {selectedOrder.delivery_address && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Endereço de Entrega</h4>
                  <p className="text-sm">
                    {(selectedOrder.delivery_address as Record<string, string>).street}, {(selectedOrder.delivery_address as Record<string, string>).number}
                    {(selectedOrder.delivery_address as Record<string, string>).complement && ` - ${(selectedOrder.delivery_address as Record<string, string>).complement}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedOrder.delivery_address as Record<string, string>).neighborhood}, {(selectedOrder.delivery_address as Record<string, string>).city}
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Itens</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span>{formatCurrency(Number(item.product_price) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(Number(selectedOrder.total))}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Status do Pedido</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Entregador</Label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um entregador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {drivers?.filter(d => d.is_active && d.is_available).map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Fechar</Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending}>
              {updateStatus.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
