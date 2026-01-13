import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Cardapio from "./pages/Cardapio";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import Drivers from "./pages/admin/Drivers";
import DriverDashboard from "./pages/driver/Dashboard";
import DriverOrders from "./pages/driver/Orders";
import DriverHistory from "./pages/driver/History";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cardapio" element={<Cardapio />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pedido-confirmado" element={<OrderConfirmed />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pedidos" element={<Orders />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/avaliacoes" element={<Reviews />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/produtos" element={<Products />} />
              <Route path="/admin/categorias" element={<Categories />} />
              <Route path="/admin/pedidos" element={<AdminOrders />} />
              <Route path="/admin/entregadores" element={<Drivers />} />
              {/* Driver Routes */}
              <Route path="/entregador" element={<DriverDashboard />} />
              <Route path="/entregador/pedidos" element={<DriverOrders />} />
              <Route path="/entregador/historico" element={<DriverHistory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
