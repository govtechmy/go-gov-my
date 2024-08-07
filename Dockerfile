FROM node:20-alpine AS base

RUN apk update && apk upgrade

WORKDIR /app

#install pnpm first
RUN ["npm", "install", "-g", "pnpm"]

COPY . .

RUN ["pnpm", "prune", "web"]

RUN ["cd", "out"]

ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DOMAIN
ARG NEXT_PUBLIC_APP_SHORT_DOMAIN

RUN ["pnpm", "i"]

RUN ["pnpm", "build"]

CMD ["sh", "-c", "cd apps/web && pnpm start"]

EXPOSE 8888
