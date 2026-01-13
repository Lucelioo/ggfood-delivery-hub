import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Search, 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle2,
  Star,
  Clock,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Explore o Cardápio',
    description: 'Navegue por nossas categorias de produtos e encontre suas comidas favoritas. Temos hambúrgueres, pizzas, sobremesas e muito mais!',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    number: '02',
    icon: ShoppingCart,
    title: 'Adicione ao Carrinho',
    description: 'Escolha os itens que deseja, selecione a quantidade e adicione observações especiais para cada produto.',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    number: '03',
    icon: MapPin,
    title: 'Informe seu Endereço',
    description: 'Cadastre seu endereço de entrega. Você pode salvar vários endereços e escolher o mais conveniente para cada pedido.',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    number: '04',
    icon: CreditCard,
    title: 'Escolha a Forma de Pagamento',
    description: 'Pague com PIX, cartão de crédito, débito ou dinheiro na entrega. Escolha a opção mais prática para você!',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    number: '05',
    icon: Truck,
    title: 'Acompanhe a Entrega',
    description: 'Receba atualizações em tempo real sobre o status do seu pedido, desde o preparo até a entrega na sua porta.',
    color: 'bg-primary/10 text-primary',
  },
  {
    number: '06',
    icon: CheckCircle2,
    title: 'Confirme o Recebimento',
    description: 'Quando receber seu pedido, confirme o recebimento no app e avalie sua experiência para ajudar outros clientes.',
    color: 'bg-accent/10 text-accent',
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Entrega Rápida',
    description: 'Receba seu pedido em 30-45 minutos',
  },
  {
    icon: Gift,
    title: 'Entrega Grátis',
    description: 'Frete grátis em pedidos acima de R$ 50',
  },
  {
    icon: Star,
    title: 'Qualidade Garantida',
    description: 'Produtos frescos e preparados na hora',
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 animate-fade-in">
                Como funciona o
                <br />
                <span className="text-gradient">GGFood?</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Pedir sua comida favorita nunca foi tão fácil! Siga os passos abaixo 
                e receba tudo na sua porta em poucos minutos.
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:gap-12">
              {steps.map((step, index) => (
                <div 
                  key={step.number}
                  className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Icon Card */}
                  <div className="flex-shrink-0">
                    <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-3xl ${step.color} flex items-center justify-center`}>
                      <step.icon className="w-12 h-12 md:w-16 md:h-16" />
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-card rounded-full shadow-card flex items-center justify-center font-bold text-primary">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 text-center md:text-left ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Por que escolher o GGFood?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div 
                  key={benefit.title}
                  className="text-center p-6 rounded-2xl bg-background/50"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto para pedir?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Explore nosso cardápio e faça seu primeiro pedido agora mesmo!
            </p>
            <Link to="/cardapio">
              <Button variant="hero" size="xl">
                Ver Cardápio
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
