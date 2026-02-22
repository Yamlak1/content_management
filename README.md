# Content Publishing System Backend

Node.js + Express backend using Prisma ORM with PostgreSQL for managing authors and articles.

## Project Structure

```text
prisma/
  schema.prisma
src/
  config/
    env.js
    prisma.js
  routes/
    index.js
    author.routes.js
    article.routes.js
  controllers/
    author.controller.js
    article.controller.js
  services/
    author.service.js
    article.service.js
  middleware/
    validate.middleware.js
    error.middleware.js
    auth.middleware.js
  app.js
  server.js
package.json
.env.example
README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and edit values:

```bash
cp .env.example .env
```

3. Run Prisma generate:

```bash
npm run prisma:generate
```

4. Run migrations:

```bash
npm run prisma:migrate
```

5. Start in development mode:

```bash
npm run dev
```

## Docker

Run API + PostgreSQL with Docker Compose from the workspace root (`content/`):

```bash
docker compose up --build
```

Services:

- API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

Stop containers:

```bash
docker compose down
```

Stop and remove DB volume:

```bash
docker compose down -v
```

## Environment Variables

Example (`.env.example`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/content_publishing?schema=public"
PORT=4000
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1h"
```

## Migration Commands

- Create/apply migration: `npm run prisma:migrate`
- Generate Prisma client: `npm run prisma:generate`

## API Documentation

Base URL: `http://localhost:4000/api`

### Health

- `GET /health`

### Authors

- `POST /authors` (register)
  - Body:

```json
{
  "name": "Ada Lovelace",
  "password": "StrongPass123!"
}
```

- `POST /authors/login`
  - Body:

```json
{
  "name": "Ada Lovelace",
  "password": "StrongPass123!"
}
```

- `GET /authors/:id`
- `GET /authors/by-name/:name`

### Articles

- `POST /articles` (requires `Authorization: Bearer <token>`)
  - Body:

```json
{
  "title": "My First Draft",
  "body": "Article body text",
  "tags": ["node", "prisma"]
}
```

`tags` can also be sent as a CSV string:

```json
{
  "title": "My First Draft",
  "body": "Article body text",
  "tags": "node, prisma, backend",
  "authorId": "d7c9f68a-12f5-4187-8d2d-a0018e40dd43"
}
```

- `PUT /articles/:id` (partial update, requires `Authorization: Bearer <token>`)
  - Body (any subset of fields):

```json
{
  "title": "Updated Title",
  "tags": "updated,tag,list"
}
```

- `PATCH /articles/:id/publish` (requires `Authorization: Bearer <token>`)
- `PATCH /articles/:id/unpublish` (requires `Authorization: Bearer <token>`)

- `GET /articles/published?tag=prisma&authorId=d7c9f68a-12f5-4187-8d2d-a0018e40dd43&limit=20&offset=0`

- `GET /articles/:id`

## Response and Error Behavior

- All endpoints return JSON.
- Validation errors return `400`.
- Missing authors/articles return `404`.
- Invalid credentials/token return `401`.
- Duplicate author names return `409`.
