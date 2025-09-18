# Portal LAF

Aplicação React (Vite) composta por **Site Público** e **Portal Gerencial** para gerenciamento de notícias, categorias e usuários com regras de RBAC. Todos os dados são persistidos em `localStorage` por meio de serviços simulando uma API.

## ⚙️ Tecnologias
- React 18 + Vite
- React Router DOM
- Tailwind CSS
- React Markdown

## 🚀 Início rápido
```bash
npm install
npm run dev
```
O servidor de desenvolvimento será iniciado em `http://localhost:5173`.

## 🔐 Credenciais seed
| Usuário | Papel | Senha |
| --- | --- | --- |
| admin@organizacao.local | admin | 123456 |
| secretaria@organizacao.local | secretaria | 123456 |
| tjd@organizacao.local | tjd | 123456 |
| editor@organizacao.local | editor | 123456 |

> Perfis `admin` e `secretaria` podem publicar em qualquer categoria. Perfis `tjd` e `editor` só enxergam as categorias permitidas.

## 📁 Estrutura
```
src/
  admin/        # Portal gerencial: páginas e componentes reutilizáveis
  public/       # Site público (feed, categoria, post)
  auth/         # Login mock e proteção de rotas
  services/     # Serviços de dados + seeds com localStorage
  store/        # Contexto global e regras de RBAC
  utils/        # Helpers (datas, slug, SEO)
```

## ✅ Funcionalidades-chave
- Feed público com filtros por categoria, ordenação por data e suporte a busca.
- Renderização de posts em Markdown e SEO básico (title, description, canonical).
- Proteção de rotas `/admin/*` com sessão em `localStorage` e expiração.
- RBAC por categoria no formulário de posts e na listagem administrativa.
- CRUD de categorias com validação de slug único e controle de ativação.
- Controle de status dos posts (rascunho, publicado, agendado) com verificação de visibilidade considerando fuso `America/Sao_Paulo`.

## 🧪 Scripts adicionais
- `npm run build` – gera build de produção.

Sinta-se à vontade para ajustar estilos, conectar uma API real ou evoluir as regras de autenticação conforme necessário.
