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

## 🗄️ Local Database Setup (MySQL with Docker)

Follow these steps to set up your local MySQL database for this project:

### 1. Start MySQL with Docker

Make sure you have Docker installed. Then, from the project root, run:

```sh
docker-compose up -d
```

### 4. Set up MySQL

- Make sure you have a MySQL server running.
- Create a database for the project.
- Update your `DATABASE_URL` in `.env.local` with your credentials.


### 4.1 How to create your database and provide the correct access to the user

```markdown
## 🗄️ Local Database Setup (MySQL with Docker)

Follow these steps to set up your local MySQL database for this project:

### 4.1.1. Start MySQL with Docker

Make sure you have Docker installed. Then, from the project root, run:

```sh
docker-compose up -d
```

This will start a MySQL server with the correct user, password, and database as defined in your `.env.local`.

---

### 4.1.2. Connect to the MySQL Container as Root

```sh
docker exec -it adhdcoach-mysql mysql -u root -p
```
Enter the root password (`rootpassword` as set in `docker-compose.yml`).

---

### 4.1.3. Create Database and User (if not already created)

Inside the MySQL prompt, run:

```sql
CREATE DATABASE IF NOT EXISTS adhd_coach;
CREATE USER IF NOT EXISTS 'adhdcoach'@'%' IDENTIFIED BY 'My:S3cr3t';
GRANT ALL PRIVILEGES ON *.* TO 'adhdcoach'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

---

### 4.1.4. Test the Connection

From your host machine, test the connection:

```sh
mysql -u adhdcoach -pMy:S3cr3t -h 127.0.0.1 -P 30306 adhd_coach
```

---

### 4.1.5. Run Prisma Migrations

Back in your project directory, run:

```sh
npx prisma migrate dev --name init
```

This will create the necessary tables as defined in `prisma/schema.prisma`.

---

**Now your local database is ready for development!**



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
