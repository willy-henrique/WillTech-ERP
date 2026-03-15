# WillTech ERP — Sacaria Agro Ráfia

Sistema web de gestão industrial e comercial para fábrica de sacaria agro ráfia: precificação, orçamentos, pedidos, produção, estoque, financeiro e relatórios.

## Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind, Recharts
- **Backend:** Firebase (Firestore, Authentication, Cloud Functions)
- **Banco:** Firestore (projeto `agrorafia-bc484`)

## Pré-requisitos

- Node.js >= 20
- Conta Firebase e projeto configurado

## Configuração

### 1. Clonar e instalar

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

- **Frontend:** variáveis `VITE_FIREBASE_*` com a config do projeto Firebase (Console > Configurações do projeto).
- **Firebase Admin (opcional):** para rodar Cloud Functions localmente, use `GOOGLE_APPLICATION_CREDENTIALS` apontando para o arquivo de chave de serviço (ex.: `agrorafia.json`). **Não commite** o arquivo de chave; use `.gitignore` e em CI use secrets (ex.: GitHub Secrets).

### 3. Executar

**App (frontend):**

```bash
npm run dev
```

**Cloud Functions (build):**

```bash
cd functions && npm run build
```

**Deploy Firebase:**

```bash
firebase deploy
```

## Estrutura

- `src/` — frontend React (módulos: dashboard, customers, products, pricing, orders, production, inventory, finance, reports, settings)
- `functions/` — Cloud Functions (Node/TypeScript): pricing engine, auth, quotations, orders, production, inventory, audit
- `firestore.rules` — regras de segurança Firestore
- `firestore.indexes.json` — índices compostos

## Segurança

- O arquivo de chave de serviço (`agrorafia.json`) deve ficar fora do repositório ou em variável de ambiente em CI.
- Autenticação: Firebase Auth (email/senha). Perfis (roles) via custom claims, definidos por Admin.
- Firestore: leitura/escrita conforme Security Rules por `request.auth.token.role`.

## Licença

Projeto privado.
