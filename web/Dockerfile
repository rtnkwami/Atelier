FROM node:24-alpine AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY ./pnpm*.yaml ./package.json ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --prod

FROM node:24-alpine AS production

WORKDIR /app

RUN apk add curl

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD [ "node", "server.js" ]