FROM node:20-alpine AS base

RUN apk update && apk upgrade

WORKDIR /app

#install pnpm first
RUN ["npm", "install", "-g", "pnpm"]

# install turbo
RUN ["npm", "install", "turbo", "--global" ]

COPY . .

COPY .gitignore ./apps/web

ENV REDIS_URL=redis://10.10.1.100

ENV REDIS_PORT=6379

# COPY packages ./packages

# RUN cd packages/ui && pnpm i && pnpm build

# COPY packages/ui ./apps/web/node_modules/@dub/ui

# RUN cd packages/utils && pnpm i && pnpm build

# COPY packages/utils ./apps/web/node_modules/@dub/utils

RUN ["pnpm", "i"]

RUN ["pnpm", "build"]

CMD ["sh", "-c", "cd apps/web && pnpm start"]

EXPOSE 8888
