# Arquitetura do MVP

---

## Stack tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR/SSG, server actions para IA, simples de rodar |
| Estilização | Tailwind CSS | Utilitários rápidos, sem CSS customizado |
| Backend | PocketBase (Go + SQLite) | Binário único, auth built-in, real-time via SSE, zero config |
| IA | Anthropic Claude Haiku (via SDK) | Rápido e barato para geração de resumos |
| Ícones | lucide-react | Leve e consistente |

---

## Diagrama de componentes

```
Browser
  │
  ├─ Next.js (localhost:3000)
  │    ├─ Pages (Client Components)
  │    │   ├─ / (Home)
  │    │   ├─ /pesquisas (busca + filtros)
  │    │   ├─ /pesquisas/[id] (detalhe)
  │    │   ├─ /pesquisas/nova (criar)
  │    │   ├─ /pesquisas/[id]/editar
  │    │   ├─ /dashboard (painel por role)
  │    │   ├─ /mensagens (inbox)
  │    │   ├─ /mensagens/[id] (chat)
  │    │   ├─ /aprovacoes (fila da instituição)
  │    │   ├─ /login
  │    │   └─ /cadastro
  │    │
  │    ├─ Server Actions (src/app/actions.ts)
  │    │   └─ generateResearchSummary() → Anthropic API
  │    │
  │    └─ PocketBase SDK (client-side)
  │         └─ Auth, CRUD, Real-time subscriptions
  │
  └─ PocketBase (127.0.0.1:8090)
       ├─ REST API automática
       ├─ Auth (JWT)
       ├─ Real-time (SSE)
       └─ SQLite (pb_data/data.db)
```

---

## Fluxos principais

### 1. Cadastro de pesquisa (RF003, RF008, RF009)

```
Pesquisador preenche formulário
    → Clica "Gerar com IA"
        → Server Action chama Anthropic API (claude-haiku-4-5)
        → Retorna: simplified_description + ods_suggestions
    → Pesquisador revisa/edita o resumo
    → Clica "Enviar para aprovação"
        → research_projects criado com status = 'pending_approval'
```

### 2. Aprovação institucional (RF004, RF005, RN002)

```
Instituição acessa /aprovacoes
    → Lista research_projects onde:
        institution = seu_id && status = 'pending_approval'
    → Clica "Aprovar"
        → status → 'approved' (publicada e visível)
    → Clica "Recusar"
        → status → 'draft' (volta ao pesquisador)
```

### 3. Busca e descoberta (RF011, RF012)

```
Usuário digita na busca + aplica filtros
    → Query PocketBase com filtros:
        status = 'approved'
        && (title ~ "query" || keywords ~ "query")
        && area = "filtro_area"        (se selecionado)
        && maturity_level = "filtro"   (se selecionado)
        && ods_tags ~ "numero"         (se selecionado)
    → Resultados paginados (12 por página)
    → Ordenados por view_count DESC, created DESC
```

### 4. Contato e chat (RF013, RF014, RF015, RN007)

```
Empresa visualiza pesquisa → clica "Iniciar contato"
    → contact_request criado (status: pending)
    → Redireciona para /mensagens/[contact_request_id]

Chat em tempo real:
    → PocketBase subscribe('messages', '*', callback)
    → Novas mensagens chegam via SSE sem polling
    → Mensagens lidas são marcadas automaticamente ao abrir
```

---

## Estrutura de arquivos do frontend

```
src/
├── app/
│   ├── globals.css           ← Tailwind + classes utilitárias (.btn-primary, .card, etc.)
│   ├── layout.tsx            ← Layout raiz (fonte, metadata)
│   ├── actions.ts            ← Server actions (IA via Anthropic)
│   ├── page.tsx              ← Home
│   ├── login/page.tsx
│   ├── cadastro/page.tsx
│   ├── pesquisas/
│   │   ├── page.tsx          ← Lista + busca
│   │   ├── nova/page.tsx     ← Criar pesquisa
│   │   └── [id]/
│   │       ├── page.tsx      ← Detalhe
│   │       └── editar/page.tsx
│   ├── dashboard/page.tsx    ← Painel (muda por role)
│   ├── mensagens/
│   │   ├── page.tsx          ← Inbox
│   │   └── [id]/page.tsx     ← Chat
│   └── aprovacoes/page.tsx   ← Fila de aprovação
│
├── components/
│   ├── Navbar.tsx            ← Navegação responsiva
│   ├── ResearchCard.tsx      ← Card de pesquisa para listas
│   ├── SearchFilters.tsx     ← Barra de busca + filtros colapsáveis
│   └── ChatWindow.tsx        ← Interface de chat com real-time
│
└── lib/
    ├── types.ts              ← Interfaces TypeScript
    ├── constants.ts          ← Listas de áreas, ODS, labels
    └── pocketbase.ts         ← Singleton do cliente PocketBase
```

---

## Decisões de design

**Por que PocketBase?**
- Binário único Go (~30MB), zero dependências externas
- Auth completo com JWT, refresh tokens, OAuth ready
- Real-time built-in via SSE — ideal para o chat
- Admin UI para gerenciar dados sem código
- SQLite é suficiente para o MVP e fácil de migrar

**Por que server actions para IA?**
- A `ANTHROPIC_API_KEY` nunca exposta no cliente
- Sem necessidade de criar uma rota `/api` separada
- Mais simples que um microserviço dedicado para o MVP

**Por que Client Components predominantes?**
- PocketBase SDK usa `localStorage` para manter auth
- Interatividade (filtros, chat, forms) requer estado no cliente
- Para produção, considerar cookies httpOnly para auth e mais SSR

---

## Considerações para produção

| Aspecto | MVP atual | Produção |
|---------|-----------|----------|
| Banco | SQLite local | PostgreSQL ou PocketBase Cloud |
| Auth | JWT em localStorage | Cookies httpOnly |
| IA | Claude Haiku | Claude Haiku com cache de prompts |
| Deploy | `npm run dev` + `./pocketbase serve` | Docker Compose ou PaaS |
| Real-time | PocketBase SSE | Mantém (escalável até ~1000 conns) |
