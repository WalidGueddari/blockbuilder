FROM node:18-alpine AS base

# Install dependencies needed in build & runtime
RUN apk update && apk add --no-cache \
  bash \
  openssl \
  curl \
  libc6-compat

WORKDIR /server

# Install PNPM, set environment, etc.
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
ENV SHELL=/bin/bash
RUN pnpm setup
ENV PNPM_HOME=/usr/local/bin
RUN pnpm install turbo --global

COPY . .

# Example build step
RUN turbo prune api --docker

# --------------------------------------------------

FROM base AS builder

# Additional build steps (installing, building, etc.)
RUN apk update && apk add --no-cache bash
WORKDIR /server
COPY --from=base /server/out/json/ .
COPY --from=base /server/out/pnpm-lock.yaml .
COPY --from=base /server/out/full/ .
COPY turbo.json turbo.json

RUN pnpm install
RUN turbo build --filter=@saas-monorepo/database
RUN turbo build --filter=api

# --------------------------------------------------

FROM base AS runner

WORKDIR /server

# Re-install bash here if needed (since we rely on Bash at runtime)
RUN apk update && apk add --no-cache bash

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
USER fastify

COPY --from=builder /server .

EXPOSE 8000
CMD ["node", "apps/api/dist/index.js"]
