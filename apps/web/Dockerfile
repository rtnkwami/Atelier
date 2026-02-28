FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY ./out/json/ ./
RUN pnpm install --frozen-lockfile

COPY ./out/full/ ./
RUN pnpm build

FROM node:24-alpine AS runner

WORKDIR /app

RUN apk add curl

COPY --from=base  /app/apps/web/.next/standalone ./
COPY --from=base  /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=base  /app/apps/web/public ./apps/web/public

ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD [ "node", "apps/web/server.js" ]