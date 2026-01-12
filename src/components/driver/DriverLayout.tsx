import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsDriver } from '@/hooks/useUserRole';
import { DriverSidebar } from './DriverSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface DriverLayoutProps {
  children: ReactNode;
  title: string;
}

export const DriverLayout = ({ children, title }: DriverLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isDriver, isLoading: roleLoading } = useIsDriver();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (!authLoading && !roleLoading && !isDriver) {
      navigate('/');
    }
  }, [user, authLoading, isDriver, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isDriver) {
    return null;
  }

  return (
    <SidebarProvider>
      <DriverSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
