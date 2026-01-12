import { categories } from '@/data/products';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <div className="sticky top-16 md:top-20 z-40 bg-background/80 backdrop-blur-lg border-b border-border py-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => onCategoryChange('all')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <span>🍽️</span>
            <span>Todos</span>
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
