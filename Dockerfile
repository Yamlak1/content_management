# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --include=dev

COPY prisma ./prisma
RUN npm run prisma:generate

COPY src ./src

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy || true; npx prisma db push --accept-data-loss && node src/server.js"]
