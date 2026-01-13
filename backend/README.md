# Backend API - Sistema de Delivery

Este diretório contém a lógica do backend da aplicação, estruturada seguindo o padrão MVC (Model-View-Controller) com camadas de serviço e repositório.

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/           # Configurações (Supabase client)
│   ├── controllers/      # Controladores da API (rotas)
│   ├── middlewares/      # Autenticação e autorização
│   ├── repositories/     # Acesso ao banco de dados
│   ├── services/         # Lógica de negócio
│   └── types/            # Tipos TypeScript
└── README.md
```

## 🏗️ Arquitetura

### Fluxo de Requisição

```
Request → Controller → Service → Repository → Database
                ↓
            Middleware (Auth/Role)
```

### Camadas

1. **Controllers**: Recebem requisições HTTP, validam entrada e retornam respostas
2. **Services**: Contém a lógica de negócio e orquestração
3. **Repositories**: Acesso direto ao banco de dados (Supabase)
4. **Middlewares**: Autenticação JWT e verificação de roles

## 🔐 Autenticação

Todas as rotas requerem autenticação via JWT (Bearer Token).

```typescript
 Header obrigatório
Authorization: Bearer <token>
```

### Roles

- `customer`: Usuário padrão (criar pedidos)
- `driver`: Entregador (aceitar e entregar pedidos)
- `admin`: Administrador (gerenciar tudo)

## 📡 Endpoints

### Pedidos (Orders)

| Método | Rota | Descrição | Role |
|--------|------|-----------|------|
| POST | /orders | Criar pedido | customer |
| GET | /orders | Listar pedidos do usuário | customer |
| GET | /orders/available | Pedidos disponíveis | driver |
| POST | /orders/:id/claim | Aceitar pedido | driver |
| PATCH | /orders/:id/status | Atualizar status | admin, driver |

### Entregador (Driver)

| Método | Rota | Descrição | Role |
|--------|------|-----------|------|
| GET | /driver/profile | Perfil do entregador | driver |
| PATCH | /driver/availability | Atualizar disponibilidade | driver |
| PATCH | /driver/location | Atualizar localização | driver |
| GET | /driver/orders | Pedidos atribuídos | driver |
| GET | /driver/history | Histórico de entregas | driver |

### Dashboard (Admin)

| Método | Rota | Descrição | Role |
|--------|------|-----------|------|
| GET | /dashboard/stats | Estatísticas gerais | admin |

## 📦 Exemplos de Request/Response

### Criar Pedido

**Request:**
```json
POST /orders
{
  "items": [
    {
      "productId": "uuid",
      "productName": "Pizza Margherita",
      "productPrice": 45.90,
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "name": "João Silva",
    "phone": "(11) 99999-9999",
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo"
  },
  "paymentMethod": "pix"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "subtotal": 91.80,
    "deliveryFee": 5.00,
    "total": 96.80
  },
  "message": "Pedido criado com sucesso"
}
```

### Aceitar Pedido (Driver)

**Request:**
```json
POST /orders/:orderId/claim
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": { "id": "uuid", "status": "out_for_delivery" },
    "driver": { "id": "uuid", "name": "Carlos" }
  },
  "message": "Pedido atribuído com sucesso"
}
```

### Dashboard Stats (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalOrders": 150,
      "totalRevenue": 12500.00,
      "availableProducts": 45,
      "availableDrivers": 8,
      "pendingOrders": 12,
      "todayOrders": 25
    },
    "generatedAt": "2024-01-13T10:30:00Z"
  }
}
```

## 🗄️ Banco de Dados

O backend utiliza **Supabase** como banco de dados PostgreSQL.

### Tabelas Principais

- `orders`: Pedidos
- `order_items`: Itens dos pedidos
- `products`: Produtos do cardápio
- `categories`: Categorias de produtos
- `drivers`: Entregadores
- `profiles`: Perfis de usuários
- `user_roles`: Roles dos usuários

### Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Autenticação via Supabase Auth (JWT)
- Verificação de roles no backend

## 🚀 Deploy

Os controllers são expostos via Edge Functions do Supabase. Cada função importa o controller correspondente:

```typescript
// supabase/functions/create-order/index.ts
import { OrderController } from '../../../backend/src/controllers/OrderController.ts'

const controller = new OrderController()
serve((req) => controller.create(req))
```
