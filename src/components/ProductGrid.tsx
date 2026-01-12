import { products, categories } from '@/data/products';
import ProductCard from './ProductCard';

interface ProductGridProps {
  activeCategory: string;
}

const ProductGrid = ({ activeCategory }: ProductGridProps) => {
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((product) => product.category === activeCategory);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  // Group products by category when showing all
  const groupedProducts = activeCategory === 'all'
    ? categories.reduce((acc, category) => {
        const categoryProducts = products.filter((p) => p.category === category.id);
        if (categoryProducts.length > 0) {
          acc[category.id] = categoryProducts;
        }
        return acc;
      }, {} as Record<string, typeof products>)
    : { [activeCategory]: filteredProducts };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto">
        {Object.entries(groupedProducts).map(([categoryId, categoryProducts]) => (
          <div key={categoryId} className="mb-10 last:mb-0">
            {activeCategory === 'all' && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">
                  {categories.find((c) => c.id === categoryId)?.icon}
                </span>
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

        {filteredProducts.length === 0 && (
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
