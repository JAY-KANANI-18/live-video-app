# Backend API Server

Node.js + Express + Prisma + PostgreSQL + Redis + WebSocket server for the live video app.

## Features

- Express REST API
- WebSocket server for real-time communication
- PostgreSQL database with Prisma ORM
- Redis for caching and session management
- JWT authentication
- Type-safe with TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Seed database (optional):
```bash
npm run prisma:seed
```

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
npm run test:watch
```

## Production

```bash
npm run build
npm start
```
