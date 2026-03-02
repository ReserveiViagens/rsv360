# Guia do Layout Moderno - RSV 360

Este guia explica como usar o novo sistema de layout moderno com alternância de tema escuro/claro implementado no sistema RSV 360.

## 🎨 Características do Novo Layout

### ✨ Recursos Principais
- **Tema Escuro/Claro**: Alternância suave entre temas com persistência no localStorage
- **Sidebar Moderno**: Menu lateral com animações e submenus expansíveis
- **Design Responsivo**: Adaptação automática para mobile e desktop
- **Transições Suaves**: Animações fluidas entre estados e temas
- **Componentes Reutilizáveis**: Layout padrão para todas as páginas

### 🎯 Componentes Disponíveis

#### 1. ModernLayout
Componente principal que engloba toda a estrutura da página.

```tsx
import ModernLayout from '../src/components/layout/ModernLayout';

<ModernLayout
  title="Título da Página"
  subtitle="Subtítulo opcional"
  showHeader={true}
  showSidebar={true}
  className="custom-class"
>
  {/* Seu conteúdo aqui */}
</ModernLayout>
```

#### 2. ModernSidebar
Menu lateral moderno com alternância de tema.

```tsx
import ModernSidebar from '../src/components/layout/ModernSidebar';

<ModernSidebar
  isOpen={showSidebar}
  onToggle={() => setShowSidebar(!showSidebar)}
  isCollapsed={isCollapsed}
  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
/>
```

#### 3. ThemeProvider
Contexto para gerenciamento de temas.

```tsx
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

// No _app.tsx
<ThemeProvider>
  <App />
</ThemeProvider>

// Em componentes
const { theme, setTheme, actualTheme, toggleTheme } = useTheme();
```

## 🚀 Como Implementar

### 1. Configuração Inicial

O sistema já está configurado no `_app.tsx`:

```tsx
import { ThemeProvider } from '../src/context/ThemeContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### 2. Usando em Páginas Existentes

#### Opção A: Substituir Layout Atual
```tsx
// Antes
<div className="min-h-screen bg-gray-50">
  {/* header, sidebar, content */}
</div>

// Depois
<ModernLayout title="Dashboard" subtitle="Visão geral">
  {/* apenas o conteúdo */}
</ModernLayout>
```

#### Opção B: Manter Estrutura Atual
```tsx
// Adicionar apenas o ModernSidebar
<ModernSidebar
  isOpen={showSidebar}
  onToggle={() => setShowSidebar(!showSidebar)}
  isCollapsed={isCollapsed}
  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
/>
```

### 3. Aplicando Temas em Componentes

```tsx
import { useTheme } from '../src/context/ThemeContext';

const MyComponent = () => {
  const { actualTheme } = useTheme();

  return (
    <div className={`${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
      <h1 className={`${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
        Título
      </h1>
    </div>
  );
};
```

## 🎨 Classes CSS para Temas

### Cores de Fundo
```css
/* Claro */
bg-white, bg-gray-50, bg-gray-100

/* Escuro */
dark:bg-gray-900, dark:bg-gray-800, dark:bg-gray-700
```

### Cores de Texto
```css
/* Claro */
text-gray-900, text-gray-700, text-gray-600, text-gray-500

/* Escuro */
dark:text-white, dark:text-gray-300, dark:text-gray-400
```

### Bordas
```css
/* Claro */
border-gray-200, border-gray-300

/* Escuro */
dark:border-gray-700, dark:border-gray-600
```

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px (sidebar como overlay)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (sidebar fixo)

### Comportamento
- **Mobile**: Sidebar como modal com overlay
- **Desktop**: Sidebar fixo com opção de colapsar
- **Transições**: Animações suaves entre estados

## 🔧 Personalização

### Adicionando Novos Itens ao Menu

Edite o arquivo `ModernSidebar.tsx`:

```tsx
const menuItems: MenuItem[] = [
  // ... itens existentes
  {
    id: 'novo-item',
    name: 'Novo Item',
    icon: <NovoIcon className="h-5 w-5" />,
    href: '/novo-item',
    description: 'Descrição do novo item',
    submenu: [
      {
        id: 'subitem',
        name: 'Subitem',
        icon: <SubIcon className="h-4 w-4" />,
        href: '/novo-item/subitem'
      }
    ]
  }
];
```

### Customizando Cores

Edite o `tailwind.config.js`:

```js
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Suas cores personalizadas
        primary: {
          // ... cores do tema
        }
      }
    }
  }
}
```

## 📋 Checklist de Migração

### Para Páginas Existentes:
- [ ] Importar `ModernLayout` ou `ModernSidebar`
- [ ] Remover header/sidebar antigos
- [ ] Aplicar classes de tema escuro
- [ ] Testar responsividade
- [ ] Verificar transições

### Para Novos Componentes:
- [ ] Usar `useTheme()` para acessar tema atual
- [ ] Aplicar classes condicionais para tema escuro
- [ ] Incluir `transition-colors duration-300`
- [ ] Testar em ambos os temas

## 🎯 Exemplo Completo

Veja o arquivo `pages/example-modern-layout.tsx` para um exemplo completo de implementação.

## 🐛 Solução de Problemas

### Tema não está aplicando
- Verifique se o `ThemeProvider` está envolvendo a aplicação
- Confirme se as classes `dark:` estão sendo aplicadas
- Verifique se o Tailwind está configurado com `darkMode: ['class']`

### Sidebar não aparece
- Verifique se `showSidebar={true}` está definido
- Confirme se o estado `isOpen` está sendo gerenciado
- Verifique se não há conflitos de z-index

### Transições não funcionam
- Confirme se `transition-colors duration-300` está aplicado
- Verifique se não há conflitos de CSS
- Teste em diferentes navegadores

## 📚 Recursos Adicionais

- [Documentação do Tailwind CSS](https://tailwindcss.com/docs/dark-mode)
- [Framer Motion](https://www.framer.com/motion/) para animações
- [Lucide React](https://lucide.dev/) para ícones
