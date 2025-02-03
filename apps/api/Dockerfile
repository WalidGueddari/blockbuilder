FROM node:18-alpine AS base
 
FROM base AS builder
 
RUN apk add --no-cache libc6-compat
RUN apk add openssl
RUN apk update
 
# Set working directory
WORKDIR /server
 
RUN apk add curl
RUN apk add openssl
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
 
ENV SHELL=/bin/bash
 
RUN pnpm setup
RUN pnpm init
 
ENV PNPM_HOME=/usr/local/bin
 
RUN pnpm install turbo --global
 
COPY . .
 
RUN turbo prune api --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
 
RUN apk add --no-cache libc6-compat
RUN apk update
 
WORKDIR /server
 
RUN apk add openssl
RUN apk add curl
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
ENV SHELL=/bin/bash
RUN pnpm setup
ENV PNPM_HOME=/usr/local/bin
 
RUN pnpm install turbo --global
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /server/out/json/ .
COPY --from=builder /server/out/pnpm-lock.yaml ./pnpm-lock.yaml
 
# Build the project and its dependencies
COPY --from=builder /server/out/full/ .
RUN ls -l
COPY turbo.json turbo.json
 
RUN pnpm install
 
RUN turbo build --filter=@saas-monorepo/database
RUN turbo build --filter=api
 
FROM base AS runner
 
WORKDIR /server
 
RUN apk add openssl
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
 
USER fastify
 
COPY --from=installer /server .
 
EXPOSE 8000
 
CMD node apps/api/dist/index.js
