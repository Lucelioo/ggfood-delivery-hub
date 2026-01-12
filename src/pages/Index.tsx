import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryNav from '@/components/CategoryNav';
import ProductGrid from '@/components/ProductGrid';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <ProductGrid activeCategory={activeCategory} />
      </main>
      <CartSidebar />
      <Footer />
    </div>
  );
};

export default Index;
