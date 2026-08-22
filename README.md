# MiniCRM AI

CRM moderno e funcional com pipeline Kanban, dashboard analítico, gestão
de clientes, atividades, tarefas e recursos de IA (OpenAI), construído com:

- **Next.js 15** (App Router, Server Components, Server Actions, Route Handlers)
- **TypeScript** forte
- **Tailwind CSS 4** com tema dark + roxo neón
- **InsForge** como backend (PostgreSQL + autenticação + SDK oficial)
- **OpenAI** para os recursos de IA (Chave restrita a server-side)
- **Recharts** para gráficos
- **dnd-kit** para drag & drop do Kanban
- **shadcn-style** UI primitives

Sem Supabase. Sem Firebase. Sem Prisma. Multi-tenant seguro via Row Level Security.

---

## COMO RODAR

### 1. Criar o projeto Next.js

```bash
npx -y create-next-app@15 minicrm-ai --typescript --tailwind --app --src-dir --import-alias "@/*" --use-npm --no-eslint --yes
```

> O projeto já está scaffoldado em `minicrm-ai/`. Basta rodar `npm install`.

### 2. Instalar dependências

```bash
cd minicrm-ai
npm install @insforge/sdk recharts lucide-react sonner date-fns clsx tailwind-merge class-variance-authority zod react-hook-form @hookform/resolvers uuid @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities openai
npm install --include=dev typescript @types/node @types/react @types/react-dom @types/d3-color @types/d3-path @types/d3-shape
```

> Em ambientes onde `npm` esteja configurado com `omit=dev`, adicione
> `--include=dev` nas instalações para garantir as devDependencies.

### 3. Criar o projeto InsForge

```bash
# 1. Login (abre o browser automaticamente OU use API key em CI)
npx -y @insforge/cli login

# 2. Criar projeto (gera .insforge/project.json)
npx -y @insforge/cli create --json --name minicrm-ai -y

# 3. Conferir o projeto linkado
npx -y @insforge/cli current
```

### 4. Onde executar o SQL

O arquivo `supabase/migrations/0001_minicrm_init.sql` cria todas as
tabelas, RLS, índices, triggers e grants.

```bash
# Opção A — Migrar via CLI (cria arquivo versionado)
npx -y @insforge/cli db migrations new 001_minicrm_init
# Edite o arquivo gerado em insforge/migrations/<timestamp>_001_minicrm_init.sql
# Cole o conteúdo do 0001_minicrm_init.sql e salve. Depois:
npx -y @insforge/cli db migrations up --all

# Opção B — Executar direto
npx -y @insforge/cli db query < supabase/migrations/0001_minicrm_init.sql
```

### 5. Variáveis de ambiente

```bash
npx -y @insforge/cli secrets get ANON_KEY
# a URL está em .insforge/project.json -> oss_host
```

Crie `.env.local` na raiz:

```bash
NEXT_PUBLIC_INSFORGE_URL=https://seu-projeto.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000

OPENAI_API_KEY=sk-...
```

> ⚠️ A `OPENAI_API_KEY` é obrigatória para usar "Gerar follow-up" e
> "Resumir reunião". Ela NUNCA aparece no frontend — apenas em
> Route Handlers.

### 6. Iniciar o projeto

```bash
npm run dev
```

Abra `http://localhost:3000`. Você será redirecionado para `/login`.

### 7. Testar login

1. **Criar conta:** clique em "Criar conta" → preencha nome, e-mail e senha
   (mínimo 8 caracteres). Se o backend exigir verificação de e-mail,
   confirme pelo link e volte para `/login`.
2. **Login:** `/login` → e-mail e senha.
3. **Logout:** avatar (canto superior direito) → "Sair".
4. **Refresh automático:** o middleware chama `/api/auth/refresh`
   silenciosamente em cada requisição.

### 8. Testar o CRUD de clientes

1. Vá em **Clientes → Novo cliente**.
2. Salve um cliente em qualquer estágio.
3. Volte para a lista: aparece, é clicável, suporta busca, filtro e ordenação.
4. Edite-o (ícone de lápis).
5. Abra o detalhe (clique no nome).
6. Exclua (ícone de lixeira, com confirmação).

### 9. Testar o Pipeline

1. Vá em **Pipeline**.
2. Crie clientes em diferentes colunas.
3. **Arraste** um card entre colunas — toast confirma.
4. `F5` → status persiste.
5. Rollback: se a persistência falhar, o card volta para a coluna original.

### 10. Testar IA

1. Abra o detalhe de qualquer cliente.
2. No card **Gerar follow-up**, descreva o contexto → clique em **Gerar**.
3. Clique em **Copiar mensagem**.
4. Vá em **Resumir reunião** (sidebar) → cole uma transcrição →
   clique em **Resumir com IA**.
5. Sugestões de tarefas podem virar tarefas reais no CRM.

### Como popular dados de demonstração

`/settings` → **Carregar dados de demonstração**. Gera clientes,
atividades e tarefas apenas para a sua conta (RLS garante isolamento).
Para remover: **Remover dados demo**.

---

## CHECKLIST DO MVP

- [x] Next.js 15 + TypeScript
- [x] Tailwind CSS 4
- [x] shadcn-style UI primitives
- [x] InsForge SDK oficial
- [x] PostgreSQL (via InsForge)
- [x] Autenticação (login, registro, logout) com `@insforge/sdk`
- [x] Middleware + refresh route
- [x] Proteção de rotas privadas
- [x] Perfil do usuário
- [x] Multi-tenant via Row Level Security
- [x] CRUD de clientes
- [x] Pipeline Kanban com drag & drop + rollback em falha
- [x] Persistência do status no InsForge
- [x] Perfil detalhado do cliente (com timeline e tarefas)
- [x] Atividades globais (filtros, busca)
- [x] Dashboard com métricas reais
- [x] Gráfico de receita com Recharts
- [x] Funil de vendas
- [x] Últimas atividades
- [x] Próximas tarefas
- [x] IA — geração de follow-up (OpenAI)
- [x] IA — resumo de reuniões (OpenAI)
- [x] Tarefas sugeridas → viram tarefas reais
- [x] `OPENAI_API_KEY` apenas server-side
- [x] Variáveis de ambiente documentadas
- [x] `tsc --noEmit` sem erros
- [x] `next build` sem erros
- [x] Loading / Empty / Error states
- [x] Toasts
- [x] Validação cliente + servidor
- [x] Confirmação antes de excluir
- [x] Responsive (desktop / tablet / mobile)
- [x] Tema dark + roxo premium
- [x] Glassmorphism discreto

---

## ESTRUTURA

```text
minicrm-ai/
├── src/
│   ├── app/
│   │   ├── api/ai/{follow-up,meeting-summary}/route.ts
│   │   ├── api/auth/refresh/route.ts
│   │   ├── (app)/
│   │   │   ├── actions/
│   │   │   │   ├── client-actions.ts
│   │   │   │   ├── activity-actions.ts
│   │   │   │   ├── task-actions.ts
│   │   │   │   └── demo-actions.ts
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── clients/page.tsx
│   │   │   ├── clients/[id]/page.tsx
│   │   │   ├── activities/page.tsx
│   │   │   ├── ai-meeting/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/{ui,layout,dashboard,pipeline,clients,activities,ai,settings}/
│   ├── data/{clients,activities,tasks,demo}.ts
│   ├── lib/insforge/{client,server,actions}.ts
│   ├── lib/auth/session.ts
│   ├── lib/openai/client.ts
│   ├── lib/validations/schemas.ts
│   ├── lib/utils.ts
│   ├── types/domain.ts
│   └── middleware.ts
└── supabase/migrations/0001_minicrm_init.sql
```

---

## SEGURANÇA

| Camada | O que está garantido |
| --- | --- |
| **PostgreSQL RLS** | Todas as tabelas públicas têm políticas com `user_id = auth.uid()`. |
| **InsForge SSR** | Refresh token em cookie `httpOnly`, access token renovada via middleware. |
| **Middleware** | Bloqueia rotas privadas sem sessão. |
| **OpenAI** | Apenas em Route Handlers — `OPENAI_API_KEY` nunca em `NEXT_PUBLIC_*`. |
| **Validação** | Zod (cliente + servidor). IDs validados como UUID. |
| **Demo data** | Usa o client autenticado — RLS impede mistura entre contas. |

---

## COMANDOS ÚTEIS

```bash
npx -y @insforge/cli current                   # ver projeto linkado
npx -y @insforge/cli db tables                 # listar tabelas
npx -y @insforge/cli db policies --table clients  # ver RLS de uma tabela
npx -y @insforge/cli db query "SELECT now();"   # SQL avulso
```
