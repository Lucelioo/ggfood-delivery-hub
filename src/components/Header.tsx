import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, MapPin, User, LogOut, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsDriver } from '@/hooks/useUserRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems, totalPrice } = useCart();
  const { user, signOut } = useAuth();
  const { isDriver } = useIsDriver();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-gradient">
              GGFood
            </span>
          </Link>

          {/* Location - Desktop */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Entregar em:</span>
            <button className="font-semibold text-foreground hover:text-primary transition-colors">
              Selecionar endereço
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Driver Panel Button - Only for drivers */}
            {isDriver && (
              <Link to="/entregador">
                <Button variant="outline" size="sm" className="gap-2">
                  <Truck className="w-4 h-4" />
                  <span className="hidden sm:inline">Painel Entregador</span>
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/carrinho">
              <Button variant="outline" size="sm" className="relative gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">
                  R$ {totalPrice.toFixed(2)}
                </span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/pedidos">Meus Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/perfil">Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Cardápio
              </Link>
              <Link
                to="/pedidos"
                className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Meus Pedidos
              </Link>
              {user ? (
                <>
                  <Link
                    to="/perfil"
                    className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium text-left text-destructive"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar / Cadastrar
                </Link>
              )}
              <div className="flex items-center gap-2 px-4 py-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Entregar em:</span>
                <button className="font-semibold text-foreground">
                  Selecionar
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
