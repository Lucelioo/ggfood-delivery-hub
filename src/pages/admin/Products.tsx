import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminProducts, useAdminCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  is_available: boolean;
  is_featured: boolean;
}

const initialForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category_id: '',
  is_available: true,
  is_featured: false,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function Products() {
  const { data: products, isLoading } = useAdminProducts();
  const { data: categories } = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: NonNullable<typeof products>[0]) => {
    setSelectedProduct(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      is_available: product.is_available ?? true,
      is_featured: product.is_featured ?? false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      toast({ title: 'Erro', description: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const data = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      is_available: form.is_available,
      is_featured: form.is_featured,
    };

    try {
      if (selectedProduct) {
        await updateProduct.mutateAsync({ id: selectedProduct, ...data });
        toast({ title: 'Sucesso', description: 'Produto atualizado com sucesso' });
      } else {
        await createProduct.mutateAsync(data);
        toast({ title: 'Sucesso', description: 'Produto criado com sucesso' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar produto', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct.mutateAsync(selectedProduct);
      toast({ title: 'Sucesso', description: 'Produto excluído com sucesso' });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir produto', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Produtos">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Gerencie os produtos do cardápio</p>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.is_featured && (
                            <Badge variant="secondary" className="text-xs">Destaque</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.categories?.name || '-'}</TableCell>
                    <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_available ? 'default' : 'secondary'}>
                        {product.is_available ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(product.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? 'Atualize as informações do produto' : 'Adicione um novo produto ao cardápio'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="available">Disponível</Label>
              <Switch
                id="available"
                checked={form.is_available}
                onCheckedChange={(v) => setForm({ ...form, is_available: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Destaque</Label>
              <Switch
                id="featured"
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending}>
              {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
