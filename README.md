# Smash & Stack

Multi-store restaurant management platform for Smash & Stack Burgers N More.

This is a branded copy of the Louisiana Hot Chicken panel. It uses the **same MongoDB cluster** with a separate database (`smash_and_stack`) so the two apps do not share records.

## Stack

- Frontend: React, Vite, TypeScript, Redux Toolkit, Tailwind CSS, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Zod

## Quick start

```bash
cd backend
npm install
npm run seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Login:

- Email: `admin@smashandstack.com`
- Password: `SmashStack!123`

API: `http://localhost:5001/api/v1`  
App (dev): `http://localhost:5174`

`npm run seed` creates the organization, system roles, and this one login only. It does **not** load demo stores, sales, or extra users.
