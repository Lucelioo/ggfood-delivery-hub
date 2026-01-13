import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, QrCode, Banknote, MapPin, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { toast } from 'sonner';

type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const createOrder = useCreateOrder();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Você precisa estar logado para fazer um pedido');
      navigate('/login');
      return;
    }

    if (!formData.name || !formData.phone || !formData.street || !formData.number || !formData.neighborhood || !formData.city) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createOrder.mutateAsync({
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          quantity: item.quantity,
          notes: item.notes,
        })),
        deliveryAddress: {
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          number: formData.number,
          complement: formData.complement || undefined,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: 'SP',
        },
        paymentMethod,
      });

      toast.success('Pedido realizado com sucesso!', {
        description: 'Você receberá atualizações sobre seu pedido.',
      });

      clearCart();
      navigate('/pedido-confirmado');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido', {
        description: 'Tente novamente em alguns instantes.',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">Faça login para continuar</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para finalizar seu pedido
            </p>
            <Link to="/login">
              <Button variant="hero" size="lg">
                Entrar
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    navigate('/cardapio');
    return null;
  }

  const paymentMethods = [
    { id: 'pix' as PaymentMethod, name: 'PIX', icon: QrCode, description: 'Pagamento instantâneo' },
    { id: 'credit_card' as PaymentMethod, name: 'Cartão de Crédito', icon: CreditCard, description: 'Crédito' },
    { id: 'debit_card' as PaymentMethod, name: 'Cartão de Débito', icon: CreditCard, description: 'Débito' },
    { id: 'cash' as PaymentMethod, name: 'Dinheiro', icon: Banknote, description: 'Pague na entrega' },
  ];

  const deliveryFee = totalPrice >= 50 ? 0 : 5.99;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/carrinho">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Finalizar Pedido</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Address */}
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Endereço de Entrega</h2>
                      <p className="text-sm text-muted-foreground">Onde devemos entregar?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="street">Rua *</Label>
                      <Input
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Nome da rua"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        name="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        placeholder="Apto, bloco..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        placeholder="Seu bairro"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Sua cidade"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Forma de Pagamento</h2>
                      <p className="text-sm text-muted-foreground">Escolha como pagar</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          paymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {paymentMethod === method.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        <method.icon className="w-6 h-6 mb-2 text-primary" />
                        <p className="font-semibold text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Resumo</h2>

                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span>
                          R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-t border-border pt-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      {deliveryFee === 0 ? (
                        <span className="text-accent font-medium">Grátis</span>
                      ) : (
                        <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                      )}
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold">Total</span>
                        <span className="text-xl font-bold text-primary">
                          R$ {finalTotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Pagamento seguro
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
