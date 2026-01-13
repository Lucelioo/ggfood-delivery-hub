import { useState, useRef, useEffect } from 'react';
import { useCategories, useProducts, Category } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingBag, Trash2, Loader2, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Cardapio() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const productsByCategory = products?.reduce((acc, product) => {
    const catId = product.category_id || 'sem-categoria';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const getItemQuantity = (productId: string) => {
    const item = items.find(i => i.product.id === productId);
    return item?.quantity || 0;
  };

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    categoryRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [categories, products]);

  if (categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left side - Menu */}
          <div className="flex-1">
            {/* Category Navigation */}
            <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm pb-4 -mx-4 px-4 border-b border-border mb-6">
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {categories?.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => scrollToCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      {category.icon && <span className="mr-1">{category.icon}</span>}
                      {category.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Products by Category */}
            <div className="space-y-10">
              {categories?.map((category) => {
                const categoryProducts = productsByCategory?.[category.id] || [];
                if (categoryProducts.length === 0) return null;

                return (
                  <div
                    key={category.id}
                    id={category.id}
                    ref={(el) => (categoryRefs.current[category.id] = el)}
                    className="scroll-mt-32"
                  >
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryProducts.map((product) => {
                        const quantity = getItemQuantity(product.id);
                        return (
                          <Card
                            key={product.id}
                            className={cn(
                              'overflow-hidden transition-all duration-200 hover:shadow-card',
                              quantity > 0 && 'ring-2 ring-primary'
                            )}
                          >
                            <CardContent className="p-0">
                              <div className="flex">
                                {product.image_url && (
                                  <div className="w-28 h-28 flex-shrink-0">
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 p-3 flex flex-col justify-between">
                                  <div>
                                    <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                      {product.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="font-bold text-primary">
                                      R$ {Number(product.price).toFixed(2)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {quantity > 0 ? (
                                        <>
                                          <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7"
                                            onClick={() => updateQuantity(product.id, quantity - 1)}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <span className="w-6 text-center text-sm font-semibold">
                                            {quantity}
                                          </span>
                                          <Button
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                              addItem({
                                                id: product.id,
                                                name: product.name,
                                                description: product.description || '',
                                                price: Number(product.price),
                                                image: product.image_url || '',
                                                category: category.name,
                                                available: product.is_available ?? true,
                                              })
                                            }
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </>
                                      ) : (
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            addItem({
                                              id: product.id,
                                              name: product.name,
                                              description: product.description || '',
                                              price: Number(product.price),
                                              image: product.image_url || '',
                                              category: category.name,
                                              available: product.is_available ?? true,
                                            })
                                          }
                                        >
                                          <Plus className="h-4 w-4 mr-1" />
                                          Adicionar
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side - Paper Receipt (Comanda) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              {/* Paper Receipt Style */}
              <div className="bg-[#fffef5] rounded-t-sm shadow-elevated relative overflow-hidden">
                {/* Torn edge top */}
                <div
                  className="absolute top-0 left-0 right-0 h-4 bg-[#fffef5]"
                  style={{
                    maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10 Q 5 0 10 10 Q 15 0 20 10 Q 25 0 30 10 Q 35 0 40 10 Q 45 0 50 10 Q 55 0 60 10 Q 65 0 70 10 Q 75 0 80 10 Q 85 0 90 10 Q 95 0 100 10 L 100 0 L 0 0 Z\'/%3E%3C/svg%3E")',
                    WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10 Q 5 0 10 10 Q 15 0 20 10 Q 25 0 30 10 Q 35 0 40 10 Q 45 0 50 10 Q 55 0 60 10 Q 65 0 70 10 Q 75 0 80 10 Q 85 0 90 10 Q 95 0 100 10 L 100 0 L 0 0 Z\'/%3E%3C/svg%3E")',
                    maskSize: '20px 10px',
                    WebkitMaskSize: '20px 10px',
                  }}
                />

                <div className="pt-6 px-4 pb-4">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3
                      className="text-lg font-bold tracking-wider"
                      style={{ fontFamily: "'Courier New', monospace" }}
                    >
                      COMANDA
                    </h3>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: "'Courier New', monospace" }}
                    >
                      --------------------------------
                    </p>
                  </div>

                  {/* Items */}
                  <ScrollArea className="h-[300px]">
                    {items.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                        <p
                          className="text-sm text-muted-foreground"
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          Comanda vazia
                        </p>
                        <p
                          className="text-xs text-muted-foreground mt-1"
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          Adicione itens do cardápio
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex justify-between text-sm"
                            style={{ fontFamily: "'Courier New', monospace" }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.quantity}x {item.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                @ R$ {item.product.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                R$ {(item.product.price * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => removeItem(item.product.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Separator */}
                  <p
                    className="text-xs text-muted-foreground text-center my-3"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    --------------------------------
                  </p>

                  {/* Totals */}
                  <div style={{ fontFamily: "'Courier New', monospace" }}>
                    <div className="flex justify-between text-sm">
                      <span>Itens:</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-1">
                      <span>TOTAL:</span>
                      <span>R$ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  {items.length > 0 && (
                    <Link to="/carrinho" className="block mt-4">
                      <Button className="w-full gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Finalizar Pedido
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Torn edge bottom */}
                <div
                  className="h-4 bg-[#fffef5]"
                  style={{
                    maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0 Q 5 10 10 0 Q 15 10 20 0 Q 25 10 30 0 Q 35 10 40 0 Q 45 10 50 0 Q 55 10 60 0 Q 65 10 70 0 Q 75 10 80 0 Q 85 10 90 0 Q 95 10 100 0 L 100 10 L 0 10 Z\'/%3E%3C/svg%3E")',
                    WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0 Q 5 10 10 0 Q 15 10 20 0 Q 25 10 30 0 Q 35 10 40 0 Q 45 10 50 0 Q 55 10 60 0 Q 65 10 70 0 Q 75 10 80 0 Q 85 10 90 0 Q 95 10 100 0 L 100 10 L 0 10 Z\'/%3E%3C/svg%3E")',
                    maskSize: '20px 10px',
                    WebkitMaskSize: '20px 10px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        {items.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-elevated z-50">
            <Link to="/carrinho">
              <Button className="w-full gap-2" size="lg">
                <ShoppingBag className="h-5 w-5" />
                Ver Comanda ({totalItems} itens) - R$ {totalPrice.toFixed(2)}
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
