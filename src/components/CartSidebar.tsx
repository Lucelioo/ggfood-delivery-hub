import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const CartSidebar = () => {
  const { items, totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6 md:w-auto z-50">
      <Link to="/carrinho">
        <div className="bg-primary text-primary-foreground p-4 md:px-6 md:py-4 md:rounded-2xl shadow-elevated flex items-center justify-between gap-4 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm opacity-90">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </p>
              <p className="font-bold">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <p className="md:hidden font-bold">
              R$ {totalPrice.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <Button variant="secondary" size="sm" className="gap-2">
            Ver carrinho
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default CartSidebar;
