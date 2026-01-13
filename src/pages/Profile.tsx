import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Plus, Home, Building, Loader2, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAddresses, useCreateAddress, useSetDefaultAddress, Address } from '@/hooks/useAddresses';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const updateProfile = useUpdateProfile();
  const createAddress = useCreateAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [addressForm, setAddressForm] = useState({
    label: 'Casa',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    zip_code: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressForm.street || !addressForm.number || !addressForm.neighborhood || !addressForm.city || !addressForm.zip_code) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createAddress.mutateAsync({
        ...addressForm,
        is_default: addresses.length === 0,
      });

      toast.success('Endereço cadastrado com sucesso!');
      setIsAddingAddress(false);
      setAddressForm({
        label: 'Casa',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        zip_code: '',
      });
    } catch (error) {
      console.error('Error creating address:', error);
      toast.error('Erro ao cadastrar endereço');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setDefaultAddress.mutateAsync(addressId);
      toast.success('Endereço padrão atualizado!');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Erro ao definir endereço padrão');
    }
  };

  const isLoading = profileLoading || addressesLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Meu Perfil</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Informações Pessoais</CardTitle>
                        <CardDescription>Seus dados de contato</CardDescription>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Editar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            if (profile) {
                              setFormData({
                                name: profile.name || '',
                                phone: profile.phone || '',
                              });
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="hero"
                          onClick={handleSaveProfile}
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            'Salvar'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Nome</p>
                          <p className="font-medium">{profile?.name || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{profile?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Telefone</p>
                          <p className="font-medium">{profile?.phone || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Meus Endereços</CardTitle>
                        <CardDescription>Endereços de entrega salvos</CardDescription>
                      </div>
                    </div>
                    <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Novo Endereço</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                          <div className="flex gap-2">
                            {['Casa', 'Trabalho'].map((label) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => setAddressForm((prev) => ({ ...prev, label }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                  addressForm.label === label
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
                              value={addressForm.zip_code}
                              onChange={handleAddressInputChange}
                              placeholder="00000-000"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="street">Rua *</Label>
                            <Input
                              id="street"
                              name="street"
                              value={addressForm.street}
                              onChange={handleAddressInputChange}
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
                                value={addressForm.number}
                                onChange={handleAddressInputChange}
                                placeholder="123"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="complement">Complemento</Label>
                              <Input
                                id="complement"
                                name="complement"
                                value={addressForm.complement}
                                onChange={handleAddressInputChange}
                                placeholder="Apto, bloco..."
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="neighborhood">Bairro *</Label>
                            <Input
                              id="neighborhood"
                              name="neighborhood"
                              value={addressForm.neighborhood}
                              onChange={handleAddressInputChange}
                              placeholder="Seu bairro"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="city">Cidade *</Label>
                            <Input
                              id="city"
                              name="city"
                              value={addressForm.city}
                              onChange={handleAddressInputChange}
                              placeholder="Sua cidade"
                              required
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setIsAddingAddress(false)}
                            >
                              Cancelar
                            </Button>
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
                                'Salvar'
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não tem endereços cadastrados
                      </p>
                      <Button variant="outline" onClick={() => setIsAddingAddress(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar primeiro endereço
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                            address.is_default
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
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
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{address.label || 'Endereço'}</span>
                              {address.is_default && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.street}, {address.number}
                              {address.complement && ` - ${address.complement}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.neighborhood}, {address.city} - {address.state}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              CEP: {address.zip_code}
                            </p>
                          </div>
                          {!address.is_default && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              disabled={setDefaultAddress.isPending}
                            >
                              Definir como padrão
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
