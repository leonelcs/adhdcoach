## ADHD Coach - Next.js App

This project is a Next.js application that helps users manage tasks and integrates with Todoist. It uses MySQL as the database and NextAuth for authentication (Google OAuth).

### Features

- Google authentication via NextAuth
- Todoist integration (fetch, create, and complete tasks)
- User and token management with Prisma ORM and MySQL

---

## Getting Started

### 1. Clone the repository

```sh
git clone <repo-url>
cd adhd_coach/adhdcoach
```

### 2. Install dependencies

```sh
npm install
```

### 3. Set up your environment variables

Copy `.env.local.example` to `.env.local` (or create `.env.local`) and fill in the required values:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
TODOIST_API_TOKEN=your_todoist_api_token
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Set up MySQL

- Make sure you have a MySQL server running.
- Create a database for the project.
- Update your `DATABASE_URL` in `.env.local` with your credentials.

### 5. Run Prisma migrations

```sh
npx prisma migrate dev --name init
```

This will create the necessary tables in your MySQL database.

### 6. Start the development server

```sh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## Useful Commands

- Open Prisma Studio (DB GUI):  
  ```sh
  npx prisma studio
  ```
- Generate Prisma client:  
  ```sh
  npx prisma generate
  ```

---

## Notes

- You need valid Google OAuth credentials and a Todoist API token to use all features.
- The app will automatically create a user in the database on first login.
- All user and token data is stored in MySQL via Prisma.

---

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.
