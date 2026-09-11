# Ostra Águas Estoque

Aplicativo para gerenciamento de estoque, cargas, clientes, pedidos e movimentações da Ostra Águas, com versões desktop e mobile.

Desenvolvido com **Tauri 2**, **React**, **React Native**, **TypeScript**, **Rust**, **SQLite** e **Supabase**.

## Tecnologias

### Desktop

- React 19
- TypeScript
- Vite
- Tauri 2
- Rust
- SQLite
- `rusqlite`

### Mobile

- React Native
- Expo
- TypeScript
- Expo Router
- Expo SQLite

### Sincronização e infraestrutura

- Supabase
- PostgreSQL
- Supabase Realtime
- GitHub Actions

## Funcionalidades

- Dashboard
- Gerenciamento de cargas
- Gerenciamento de clientes
- Gerenciamento de pedidos
- Gerenciamento de movimentações
- Controle de estoque
- Cálculo de custos, preços e lucros esperados
- Status de pedidos
- Backup do banco de dados
- Funcionamento offline
- Sincronização entre dispositivos
- Atualizações automáticas do aplicativo desktop

### Status de pedidos

Os pedidos podem assumir os seguintes estados:

- `Pendente`
- `Em Rota`
- `Entregue`
- `Cancelado`

---

## Arquitetura

O sistema utiliza uma arquitetura híbrida, na qual **Desktop e Mobile mantêm bancos SQLite locais** para permitir o funcionamento offline.

O **Supabase** atua como camada compartilhada de sincronização entre os dispositivos, utilizando PostgreSQL para armazenamento remoto e Supabase Realtime para distribuição das alterações.

```text
┌──────────────────────────────┐
│           Mobile             │
│      React Native / Expo     │
│                              │
│         SQLite local         │
└──────────────┬───────────────┘
               │
               │ Sincronização
               ▼
┌──────────────────────────────┐
│          Supabase            │
│                              │
│   PostgreSQL + Realtime      │
└──────────────┬───────────────┘
               │
               │ Sincronização / Realtime
               ▼
┌──────────────────────────────┐
│          Desktop             │
│      Tauri + React           │
│                              │
│         SQLite local         │
└──────────────────────────────┘
