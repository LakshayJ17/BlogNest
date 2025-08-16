# BlogNest

🚀 **BlogNest** is a modern, high-performance blogging platform where users can read, write, and share insightful articles. Built with a robust full-stack architecture, it ensures a smooth and engaging experience.

🌐 **Live URL**: [BlogNest](https://blognest-project.vercel.app/)

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **React** – Modern UI framework
- **Vite** – Fast build tool
- **Tailwind CSS** – Utility-first CSS framework
- **React Router** – Client-side navigation
- **Axios** – API handling
- **TypeScript** – Type safety

### Backend (`/backend`)
- **Express.js** – Fast, unopinionated Node.js web framework
- **Prisma ORM** – Type-safe database ORM for PostgreSQL
- **Zod** – Schema validation for API inputs
- **JWT** – Secure authentication
- **bcryptjs** – Password hashing
- **OpenAI** – AI-powered blog generation and summarization
- **dotenv** – Environment variable management
- **CORS** – Cross-origin resource sharing

### Shared (`/common`)
- **TypeScript** – Shared types and validation schemas

---

## 📦 Folder Structure

```
medium/
│
├── backend/      # Express API, Prisma, routes, migrations
│   ├── src/
│   │   ├── index.ts
│   │   └── routes/
│   │       ├── user.ts
│   │       └── blog.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/     # React app (Vite, Tailwind, etc.)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── common/       # Shared types and validation logic
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 📌 Features

✔️ User authentication (JWT, Google OAuth)  
✔️ Profile management  
✔️ Create, edit, and share blog posts  
✔️ Like and summarize posts  
✔️ AI-powered blog generation and summaries (OpenAI)  
✔️ Responsive and modern UI  
✔️ PostgreSQL database (via Prisma)  
✔️ Type-safe API and validation (Zod, TypeScript)  
✔️ Production-ready structure

---

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies** in each folder (`backend`, `frontend`, `common`)
3. **Set up environment variables** in `backend/.env`
4. **Run Prisma migrations** in `backend`:
   ```sh
   npx prisma migrate dev
   ```
5. **Start the backend**
   ```sh
   npm run dev
   ```
6. **Start the frontend**
   ```sh
   npm run dev
   ```
7. **Visit the app:** [http://localhost:5173](http://localhost:5173)

---

## 📄