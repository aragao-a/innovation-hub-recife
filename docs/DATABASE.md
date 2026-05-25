# Schema do Banco de Dados

O banco de dados é gerenciado pelo **PocketBase** (SQLite). As coleções são criadas via `backend/pb_schema.json`.

---

## Coleções

### `users` (auth — nativa do PocketBase)

Campos extras adicionados à coleção de autenticação padrão:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | text | sim | Nome completo |
| `role` | select | sim | `researcher` \| `institution` \| `business` \| `investor` |
| `institution` | text | não | ID da instituição (para pesquisadores) |
| `bio` | text | não | Breve descrição |
| `email` | email | sim | Nativo PocketBase |
| `avatar` | file | não | Nativo PocketBase |

---

### `institutions`

Entidades de ensino e pesquisa que agrupam pesquisadores.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | text | sim | Nome da instituição |
| `type` | text | não | Universidade Federal, Startup, etc. |
| `city` | text | não | Cidade (default: Recife) |
| `admin` | text | não | ID do usuário administrador |

**Regras de acesso:**
- Listagem/visualização: pública
- Criação: usuário autenticado
- Atualização/exclusão: requer admin

---

### `research_projects`

Core da plataforma. Armazena cada pesquisa cadastrada.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `title` | text | sim | Título da pesquisa |
| `area` | text | sim | Área de conhecimento |
| `keywords` | text | não | Palavras-chave separadas por vírgula |
| `technical_description` | editor | sim | Descrição técnica completa |
| `simplified_description` | editor | não | Versão acessível (gerada por IA) |
| `status` | select | sim | `draft` \| `pending_approval` \| `approved` \| `hidden` |
| `maturity_level` | select | sim | `basic` \| `developing` \| `ready` |
| `ods_tags` | json | não | Array de IDs dos ODS: `[3, 9, 11]` |
| `researcher` | relation→users | sim | Pesquisador responsável |
| `institution` | relation→institutions | não | Instituição vinculada |
| `view_count` | number | não | Contador de visualizações |
| `contact_count` | number | não | Contador de solicitações de contato |

**Status lifecycle:**
```
draft → pending_approval → approved
                         ↘ draft (recusada pela instituição)
approved → hidden (pesquisador oculta)
hidden → approved (pesquisador restaura)
```

**Regras de acesso:**
- Listagem/visualização: apenas `status = 'approved'`, ou o próprio pesquisador
- Criação: usuário com `role = 'researcher'`
- Atualização: pesquisador dono ou instituição

---

### `contact_requests`

Registra quando uma organização inicia contato com um pesquisador.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `research` | relation→research_projects | sim | Pesquisa de interesse |
| `organization` | relation→users | sim | Usuário que iniciou o contato |
| `researcher` | relation→users | sim | Pesquisador da pesquisa |
| `status` | select | sim | `pending` \| `accepted` \| `rejected` |

**Regras de acesso:**
- Listagem/visualização: apenas os dois participantes
- Criação: qualquer usuário autenticado

---

### `messages`

Mensagens do chat interno entre organização e pesquisador.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `contact_request` | relation→contact_requests | sim | Conversa à qual pertence |
| `sender` | relation→users | sim | Usuário que enviou |
| `content` | text | sim | Conteúdo da mensagem |
| `read` | bool | não | Se foi lida pelo destinatário |

**Regras de acesso:**
- Apenas participantes da `contact_request` correspondente

---

## Relacionamentos

```
users ──────────── research_projects
  │  (researcher)        │
  │                      │ (institution)
  │                 institutions
  │
  ├── contact_requests ──── research_projects
  │    (organization)
  │    (researcher)
  │
  └── messages ──── contact_requests
       (sender)
```

---

## Dados persistidos pelo PocketBase

O PocketBase armazena tudo em `backend/pb_data/`:
```
pb_data/
├── data.db          ← banco SQLite principal
├── logs.db          ← logs de acesso
└── storage/         ← arquivos enviados (avatares, etc.)
```

> **Backup:** copie a pasta `pb_data/` inteira.
