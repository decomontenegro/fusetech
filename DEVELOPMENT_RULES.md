# 📋 **REGRAS DE DESENVOLVIMENTO - FUSETECH**

**Versão**: 1.0.0
**Data**: $(date)
**Status**: ✅ **ATIVO**

---

## 🎯 **PADRÕES OBRIGATÓRIOS**

### **📱 TECNOLOGIAS APROVADAS:**

**✅ PERMITIDO:**
- **Next.js 14+**: Framework React
- **TypeScript**: Tipagem obrigatória
- **Tailwind CSS 3.4+**: Styling único
- **Zustand**: State management
- **React Hook Form**: Formulários
- **Neon Database**: PostgreSQL serverless
- **Axios**: HTTP client

**❌ PROIBIDO:**
- **Supabase**: Muito burocrático
- **CSS inline**: Usar apenas Tailwind
- **JavaScript puro**: Sempre TypeScript
- **Styled Components**: Conflita com Tailwind
- **Redux**: Usar Zustand

---

## 🔧 **PADRÕES DE CÓDIGO**

### **📝 ESTRUTURA DE COMPONENTES:**

```typescript
// ✅ CORRETO
interface ComponentProps {
  title: string;
  isVisible?: boolean;
}

export function Component({ title, isVisible = true }: ComponentProps) {
  // 1. Hooks no topo
  const [state, setState] = useState<string>('');
  
  // 2. Funções auxiliares
  const handleClick = () => {
    setState(title);
  };
  
  // 3. Early returns
  if (!isVisible) return null;
  
  // 4. JSX return
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={handleClick}>Click</button>
    </div>
  );
}

export default Component;
```

### **📝 PADRÕES DE NAMING:**

```typescript
// ✅ CORRETO
const userName = 'john'; // camelCase para variáveis
const USER_ROLE = 'admin'; // UPPER_CASE para constantes
function getUserData() {} // camelCase para funções
interface UserProps {} // PascalCase para interfaces
type UserType = string; // PascalCase para types
export function UserCard() {} // PascalCase para componentes
```

### **📝 PADRÕES DE IMPORTS:**

```typescript
// ✅ CORRETO - Ordem de imports
// 1. React e Next.js
import React from 'react';
import { NextPage } from 'next';

// 2. Bibliotecas externas
import axios from 'axios';
import { useForm } from 'react-hook-form';

// 3. Componentes internos
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';

// 4. Utilitários e tipos
import { cn } from '@/lib/utils';
import type { User } from '@/types/user';
```

---

## 🎨 **PADRÕES DE STYLING**

### **📝 TAILWIND CSS OBRIGATÓRIO:**

```typescript
// ✅ CORRETO
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>

// ❌ ERRADO - CSS inline
<div style={{ padding: '16px', backgroundColor: 'white' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Title</h2>
</div>

// ❌ ERRADO - CSS modules
import styles from './Component.module.css';
<div className={styles.container}>
```

### **📝 CLASSES RESPONSIVAS:**

```typescript
// ✅ CORRETO - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 text-sm md:text-base lg:text-lg">
    Responsive content
  </div>
</div>
```

---

## 📊 **PADRÕES DE STATE MANAGEMENT**

### **📝 ZUSTAND PARA ESTADO GLOBAL:**

```typescript
// ✅ CORRETO - Store Zustand
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

### **📝 USESTATE PARA ESTADO LOCAL:**

```typescript
// ✅ CORRETO - Estado local
function Component() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Data[]>([]);
  
  // Lógica do componente
}
```

---

## 🌐 **PADRÕES DE API**

### **📝 AXIOS PARA HTTP:**

```typescript
// ✅ CORRETO - Cliente HTTP
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Interceptors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📋 **PADRÕES DE COMMIT**

### **📝 CONVENTIONAL COMMITS:**

```bash
# ✅ CORRETO
feat: adiciona autenticação com Neon
fix: corrige bug no login
refactor: reestrutura componentes de auth
docs: atualiza README com novas regras
style: formata código com Prettier
test: adiciona testes para UserCard
chore: atualiza dependências

# ❌ ERRADO
update stuff
fix bug
new feature
```

### **📝 ESTRUTURA DE COMMIT:**

```
tipo(escopo): descrição curta

Descrição mais detalhada se necessário.

- Lista de mudanças
- Outra mudança importante

Closes #123
```

---

## 🧪 **PADRÕES DE TESTES**

### **📝 VITEST OBRIGATÓRIO:**

```typescript
// ✅ CORRETO - Teste de componente
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should render user name', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    
    render(<UserCard user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

---

## 📁 **ESTRUTURA DE PASTAS**

### **📝 ORGANIZAÇÃO OBRIGATÓRIA:**

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Route groups
│   ├── dashboard/      # Páginas do dashboard
│   └── globals.css     # Estilos globais
├── components/         # Componentes reutilizáveis
│   ├── ui/            # Componentes base
│   ├── forms/         # Componentes de formulário
│   └── layout/        # Componentes de layout
├── lib/               # Bibliotecas e utilitários
│   ├── auth/          # Lógica de autenticação
│   ├── database/      # Configuração do banco
│   └── utils/         # Funções utilitárias
├── hooks/             # Custom hooks
├── types/             # TypeScript types
└── constants/         # Constantes da aplicação
```

---

## ⚡ **PERFORMANCE**

### **📝 OTIMIZAÇÕES OBRIGATÓRIAS:**

```typescript
// ✅ CORRETO - Lazy loading
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});

// ✅ CORRETO - Memoização
import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);
  
  return <div>{processedData}</div>;
});
```

---

## 🔒 **SEGURANÇA**

### **📝 REGRAS DE SEGURANÇA:**

```typescript
// ✅ CORRETO - Validação de entrada
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ✅ CORRETO - Sanitização
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);
```

---

## 📞 **ENFORCEMENT**

### **🚨 VERIFICAÇÕES AUTOMÁTICAS:**

- **Pre-commit hooks**: ESLint + Prettier
- **CI/CD**: Testes obrigatórios
- **Code review**: Aprovação obrigatória
- **Type checking**: TypeScript strict mode

### **🎯 CONSEQUÊNCIAS:**

- **Não seguir padrões**: PR rejeitado
- **Código sem tipos**: Build falha
- **Testes faltando**: Deploy bloqueado
- **Commits mal formatados**: Hook bloqueia

---

**🎊 REGRAS ESTABELECIDAS - CÓDIGO PADRONIZADO! 🌟**

**Seguindo essas regras, garantimos qualidade, consistência e manutenibilidade do código! 🚀**
