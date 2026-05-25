# Hub de Inovação e Pesquisa do Recife

Plataforma que conecta pesquisas acadêmicas de Recife com empresas, gestores públicos e investidores. Pesquisadores cadastram projetos com resumos em linguagem acessível (gerados por IA), e organizações encontram soluções relevantes para seus desafios.

---

## Rodando em 3 passos

### Pré-requisitos
- Node.js 18+
- Bash (Linux/macOS/WSL)
- Conta na [Anthropic](https://console.anthropic.com/) para a feature de IA *(opcional, o MVP funciona sem)*

---

### Passo 1 — Backend (PocketBase)

```bash
cd backend
bash setup.sh         # baixa o binário do PocketBase (~30MB)
./pocketbase serve    # inicia em http://127.0.0.1:8090
```

Na primeira execução, acesse **http://127.0.0.1:8090/_/** e crie um admin.

Depois, execute o script de setup das coleções:

```bash
node setup_collections.js seu@email.com suasenha
```

> **Alternativa manual:** No painel admin → Settings → Import collections → selecione `backend/pb_schema.json`.
> Depois edite a coleção `users` e adicione os campos: `role` (select), `institution` (text), `bio` (text).

---

### Passo 2 — Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
# Edite .env.local e preencha ANTHROPIC_API_KEY (opcional)
npm install
npm run dev           # inicia em http://localhost:3000
```

---

### Passo 3 — Acesse

| URL | O que é |
|-----|---------|
| http://localhost:3000 | Aplicação |
| http://127.0.0.1:8090/_/ | Painel admin do PocketBase |

---

## Funcionalidades do MVP

| Feature | Status |
|---------|--------|
| Cadastro/Login com perfis (pesquisador, instituição, empresa, investidor) | ✅ |
| Cadastro de pesquisas com descrição técnica | ✅ |
| Resumo acessível gerado por IA (Claude Haiku) | ✅ |
| Sugestão automática de ODS via IA | ✅ |
| Fluxo de aprovação (instituição aprova antes de publicar) | ✅ |
| Busca com filtros (área, maturidade, ODS, palavras-chave) | ✅ |
| Perfil completo da pesquisa com abas técnica/acessível | ✅ |
| Solicitação de contato pesquisador ↔ empresa | ✅ |
| Chat interno em tempo real (via PocketBase SSE) | ✅ |
| Dashboard por perfil com métricas | ✅ |
| Ocultar/restaurar pesquisas | ✅ |
| Design responsivo | ✅ |

---

## Estrutura do projeto

```
innovation-hub-recife/
├── backend/
│   ├── pocketbase            ← binário (gerado pelo setup.sh)
│   ├── pb_data/              ← banco SQLite (gerado automaticamente)
│   ├── pb_schema.json        ← schema das coleções
│   ├── setup.sh              ← baixa e configura o PocketBase
│   └── setup_collections.js  ← cria coleções via API
├── frontend/
│   ├── src/
│   │   ├── app/              ← páginas (Next.js App Router)
│   │   ├── components/       ← componentes reutilizáveis
│   │   └── lib/              ← tipos, constantes, cliente PocketBase
│   └── .env.example
└── docs/
    ├── DATABASE.md           ← schema do banco de dados
    └── ARCHITECTURE.md       ← arquitetura e fluxos
```

---

## Documentação

- [Banco de dados](docs/DATABASE.md)
- [Arquitetura](docs/ARCHITECTURE.md)
