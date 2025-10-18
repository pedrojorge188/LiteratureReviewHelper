FROM node:20-alpine

WORKDIR /app

COPY src/frontend/package.json src/frontend/package-lock.json* ./

RUN npm ci


COPY src/frontend/ .

RUN npm run build
