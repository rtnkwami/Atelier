FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY ./out/json/ ./
RUN pnpm install --frozen-lockfile

COPY ./out/full/ ./
RUN pnpm build

RUN pnpm --filter=api --prod deploy ./prod

FROM node:24-alpine

RUN apk add --no-cache curl

RUN adduser -D -H nestjs

WORKDIR /app

COPY --chown=nestjs:nestjs --from=base /app/prod/dist/ ./dist
COPY --chown=nestjs:nestjs --from=base /app/prod/node_modules ./node_modules

EXPOSE 5000

USER nestjs

CMD [ "node", "dist/main.js" ]