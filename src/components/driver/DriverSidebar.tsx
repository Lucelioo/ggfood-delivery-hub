import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverProfile, useUpdateDriverAvailability } from '@/hooks/useDriverData';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  History,
  LogOut,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { title: 'Minhas Entregas', url: '/entregador', icon: LayoutDashboard },
  { title: 'Pedidos Ativos', url: '/entregador/pedidos', icon: Package },
  { title: 'Histórico', url: '/entregador/historico', icon: History },
];

export const DriverSidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const { data: driverProfile } = useDriverProfile();
  const updateAvailability = useUpdateDriverAvailability();
  const { toast } = useToast();

  const handleAvailabilityChange = async (checked: boolean) => {
    try {
      await updateAvailability.mutateAsync(checked);
      toast({
        title: checked ? 'Você está online!' : 'Você está offline',
        description: checked ? 'Agora você pode receber pedidos' : 'Você não receberá novos pedidos',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar status',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link to="/entregador" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">🛵</span>
          </div>
          <span className="font-bold text-lg">Entregador</span>
        </Link>
      </SidebarHeader>

      {/* Availability Toggle */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={driverProfile?.is_available ? 'default' : 'secondary'}>
              {driverProfile?.is_available ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <Switch
            checked={driverProfile?.is_available ?? false}
            onCheckedChange={handleAvailabilityChange}
            disabled={updateAvailability.isPending}
          />
        </div>
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 space-y-2">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Voltar à Loja
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
