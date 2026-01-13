import { useState, useEffect } from 'react';
import { MapPin, Plus, Check, Home, Building, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAddresses, useCreateAddress, useSetDefaultAddress, Address } from '@/hooks/useAddresses';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddressDialogProps {
  trigger?: React.ReactNode;
  onAddressSelect?: (address: Address) => void;
}

const AddressDialog = ({ trigger, onAddressSelect }: AddressDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { user } = useAuth();
  const { data: addresses = [], isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [formData, setFormData] = useState({
    label: 'Casa',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    zip_code: '',
  });

  const defaultAddress = addresses.find((addr) => addr.is_default);

  useEffect(() => {
    if (open && addresses.length === 0 && user) {
      setIsAddingNew(true);
    }
  }, [open, addresses.length, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.street || !formData.number || !formData.neighborhood || !formData.city || !formData.zip_code) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const newAddress = await createAddress.mutateAsync({
        ...formData,
        is_default: addresses.length === 0,
      });

      toast.success('Endereço cadastrado com sucesso!');
      setIsAddingNew(false);
      setFormData({
        label: 'Casa',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        zip_code: '',
      });

      if (onAddressSelect && newAddress) {
        onAddressSelect(newAddress);
      }
    } catch (error) {
      console.error('Error creating address:', error);
      toast.error('Erro ao cadastrar endereço');
    }
  };

  const handleSelectAddress = async (address: Address) => {
    try {
      if (!address.is_default) {
        await setDefaultAddress.mutateAsync(address.id);
      }
      
      if (onAddressSelect) {
        onAddressSelect(address);
      }
      
      toast.success('Endereço selecionado');
      setOpen(false);
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Erro ao selecionar endereço');
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <button className="font-semibold text-foreground hover:text-primary transition-colors">
              Selecionar endereço
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Endereço de Entrega</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Faça login para salvar e gerenciar seus endereços
            </p>
            <Button onClick={() => setOpen(false)} asChild>
              <a href="/login">Entrar</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="font-semibold text-foreground hover:text-primary transition-colors">
            {defaultAddress 
              ? `${defaultAddress.street}, ${defaultAddress.number}`
              : 'Selecionar endereço'
            }
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAddingNew ? 'Novo Endereço' : 'Endereço de Entrega'}
          </DialogTitle>
        </DialogHeader>

        {isAddingNew ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 mb-4">
              {['Casa', 'Trabalho'].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, label }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.label === label
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {label === 'Casa' ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    <Building className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            <div>
              <Label htmlFor="zip_code">CEP *</Label>
              <Input
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                placeholder="00000-000"
                required
              />
            </div>

            <div>
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex gap-3 pt-4">
              {addresses.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                variant="hero"
                className="flex-1"
                disabled={createAddress.isPending}
              >
                {createAddress.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Endereço'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem endereços cadastrados
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      address.is_default
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {address.label === 'Trabalho' ? (
                        <Building className="w-5 h-5 text-primary" />
                      ) : (
                        <Home className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{address.label || 'Endereço'}</span>
                        {address.is_default && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {address.street}, {address.number}
                        {address.complement && ` - ${address.complement}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.neighborhood}, {address.city}
                      </p>
                    </div>
                    {address.is_default && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar novo endereço
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;
