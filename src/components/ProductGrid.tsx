import { useProducts, useCategories, Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  activeCategory: string;
}

const ProductGrid = ({ activeCategory }: ProductGridProps) => {
  const { data: products, isLoading: productsLoading } = useProducts(activeCategory === 'all' ? undefined : activeCategory);
  const { data: categories } = useCategories();

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category?.icon || '🍽️';
  };

  // Group products by category when showing all
  const groupedProducts = activeCategory === 'all' && categories
    ? categories.reduce((acc, category) => {
        const categoryProducts = products?.filter((p) => p.category_id === category.id) || [];
        if (categoryProducts.length > 0) {
          acc[category.id] = categoryProducts;
        }
        return acc;
      }, {} as Record<string, Product[]>)
    : products ? { [activeCategory]: products } : {};

  if (productsLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto">
        {Object.entries(groupedProducts).map(([categoryId, categoryProducts]) => (
          <div key={categoryId} className="mb-10 last:mb-0">
            {activeCategory === 'all' && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{getCategoryIcon(categoryId)}</span>
                <h2 className="text-2xl font-bold">{getCategoryName(categoryId)}</h2>
                <span className="text-sm text-muted-foreground">
                  ({categoryProducts.length} itens)
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}

        {(!products || products.length === 0) && !productsLoading && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
