FROM node:24-alpine AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY ./pnpm*.yaml ./package.json ./
RUN pnpm install --frozen-lockfile

COPY . .

# Prisma needs this to generate the client even if it is a fake url
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm prisma generate

RUN pnpm build

RUN pnpm prune --prod


FROM node:24-alpine AS production

WORKDIR /app

RUN apk add curl

COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/node_modules/ ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma/ ./prisma
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 5000

CMD ["node", "dist/main.js"]
