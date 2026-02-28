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

FROM node:24-alpine AS runner

WORKDIR /app

RUN apk add curl

COPY --from=base /app/prod/dist/ ./dist
COPY --from=base /app/prod/node_modules ./node_modules

EXPOSE 5000

CMD [ "node", "dist/main.js" ]