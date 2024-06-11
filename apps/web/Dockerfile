FROM node:19.4.0-alpine3.16 as base

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN yarn global add pnpm

FROM base as builder
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=web --docker

FROM base as installer
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=web...

FROM base as runner
WORKDIR /app
COPY --from=installer /app/apps/web/next.config.js .
COPY --from=installer /app/apps/web/package.json .
CMD pnpm dev --scope=web