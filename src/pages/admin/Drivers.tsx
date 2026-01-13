import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  useAdminDrivers, 
  useUpdateDriver, 
  useDeleteDriver, 
  useUsersWithoutDriverRole,
  useCreateDriverFromUser 
} from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Pencil, Trash2, Loader2, Bike, Car, UserPlus, Check, ChevronsUpDown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DriverForm {
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate: string;
  is_active: boolean;
  is_available: boolean;
}

interface NewDriverForm {
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate: string;
}

const initialForm: DriverForm = {
  name: '',
  phone: '',
  vehicle_type: 'moto',
  vehicle_plate: '',
  is_active: true,
  is_available: false,
};

const initialNewDriverForm: NewDriverForm = {
  user_id: '',
  name: '',
  phone: '',
  vehicle_type: 'moto',
  vehicle_plate: '',
};

const vehicleTypes = [
  { value: 'moto', label: 'Moto', icon: Bike },
  { value: 'carro', label: 'Carro', icon: Car },
  { value: 'bicicleta', label: 'Bicicleta', icon: Bike },
];

export default function Drivers() {
  const navigate = useNavigate();
  const { data: drivers, isLoading } = useAdminDrivers();
  const { data: availableUsers } = useUsersWithoutDriverRole();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();
  const createDriver = useCreateDriverFromUser();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [form, setForm] = useState<DriverForm>(initialForm);
  const [newDriverForm, setNewDriverForm] = useState<NewDriverForm>(initialNewDriverForm);

  const handleOpenEdit = (driver: NonNullable<typeof drivers>[0]) => {
    setSelectedDriver(driver.id);
    setForm({
      name: driver.name,
      phone: driver.phone,
      vehicle_type: driver.vehicle_type || 'moto',
      vehicle_plate: driver.vehicle_plate || '',
      is_active: driver.is_active ?? true,
      is_available: driver.is_available ?? false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedDriver) return;
    if (!form.name || !form.phone) {
      toast({ title: 'Erro', description: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    try {
      await updateDriver.mutateAsync({
        id: selectedDriver,
        name: form.name,
        phone: form.phone,
        vehicle_type: form.vehicle_type,
        vehicle_plate: form.vehicle_plate || null,
        is_active: form.is_active,
        is_available: form.is_available,
      });
      toast({ title: 'Sucesso', description: 'Entregador atualizado com sucesso' });
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar entregador', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedDriver) return;
    
    try {
      await deleteDriver.mutateAsync(selectedDriver);
      toast({ title: 'Sucesso', description: 'Entregador excluído com sucesso' });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir entregador', variant: 'destructive' });
    }
  };

  const toggleAvailability = async (driver: NonNullable<typeof drivers>[0]) => {
    try {
      await updateDriver.mutateAsync({
        id: driver.id,
        is_available: !driver.is_available,
      });
      toast({
        title: driver.is_available ? 'Entregador indisponível' : 'Entregador disponível',
        description: `${driver.name} agora está ${driver.is_available ? 'offline' : 'online'}`,
      });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar status', variant: 'destructive' });
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = availableUsers?.find(u => u.user_id === userId);
    if (user) {
      setNewDriverForm({
        user_id: userId,
        name: user.name || '',
        phone: user.phone || '',
        vehicle_type: 'moto',
        vehicle_plate: '',
      });
    }
  };

  const handleCreateDriver = async () => {
    if (!newDriverForm.user_id || !newDriverForm.name || !newDriverForm.phone) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    try {
      await createDriver.mutateAsync(newDriverForm);
      toast({ title: 'Sucesso', description: 'Entregador criado com sucesso' });
      setCreateDialogOpen(false);
      setNewDriverForm(initialNewDriverForm);
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao criar entregador', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Entregadores">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Gerencie a equipe de entregadores</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Entregador
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : drivers?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum entregador cadastrado.</p>
            <p className="text-sm mt-2">Os entregadores são cadastrados quando usuários recebem a função de entregador.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Disponível</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers?.map((driver) => {
                  const VehicleIcon = vehicleTypes.find(v => v.value === driver.vehicle_type)?.icon || Bike;
                  return (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <VehicleIcon className="h-4 w-4" />
                          {vehicleTypes.find(v => v.value === driver.vehicle_type)?.label || driver.vehicle_type}
                        </div>
                      </TableCell>
                      <TableCell>{driver.vehicle_plate || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={driver.is_active ? 'default' : 'secondary'}>
                          {driver.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={driver.is_available ?? false}
                          onCheckedChange={() => toggleAvailability(driver)}
                          disabled={!driver.is_active}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(driver)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate('/entregador')}
                          title="Acessar painel do entregador"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedDriver(driver.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Entregador</DialogTitle>
            <DialogDescription>Atualize as informações do entregador</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo</Label>
                <Select value={form.vehicle_type} onValueChange={(v) => setForm({ ...form, vehicle_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((v) => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  value={form.vehicle_plate}
                  onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })}
                  placeholder="ABC-1234"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Ativo</Label>
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="available">Disponível para entregas</Label>
              <Switch
                id="available"
                checked={form.is_available}
                onCheckedChange={(v) => setForm({ ...form, is_available: v })}
                disabled={!form.is_active}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={updateDriver.isPending}>
              {updateDriver.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Driver Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Entregador</DialogTitle>
            <DialogDescription>Selecione um usuário para torná-lo entregador</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecionar Usuário *</Label>
              <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userSelectOpen}
                    className="w-full justify-between font-normal"
                  >
                    {newDriverForm.user_id
                      ? availableUsers?.find((user) => user.user_id === newDriverForm.user_id)?.name || 'Usuário selecionado'
                      : "Digite para buscar usuário..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por nome ou email..." />
                    <CommandList>
                      <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                      <CommandGroup>
                        {availableUsers?.map((user) => (
                          <CommandItem
                            key={user.user_id}
                            value={`${user.name} ${user.email}`}
                            onSelect={() => {
                              handleUserSelect(user.user_id);
                              setUserSelectOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newDriverForm.user_id === user.user_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-name">Nome *</Label>
              <Input
                id="new-name"
                value={newDriverForm.name}
                onChange={(e) => setNewDriverForm({ ...newDriverForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-phone">Telefone *</Label>
              <Input
                id="new-phone"
                value={newDriverForm.phone}
                onChange={(e) => setNewDriverForm({ ...newDriverForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Veículo</Label>
                <Select 
                  value={newDriverForm.vehicle_type} 
                  onValueChange={(v) => setNewDriverForm({ ...newDriverForm, vehicle_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((v) => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-plate">Placa</Label>
                <Input
                  id="new-plate"
                  value={newDriverForm.vehicle_plate}
                  onChange={(e) => setNewDriverForm({ ...newDriverForm, vehicle_plate: e.target.value })}
                  placeholder="ABC-1234"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateDriver} disabled={createDriver.isPending}>
              {createDriver.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Entregador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Entregador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este entregador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
