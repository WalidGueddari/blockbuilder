FROM node:18-alpine AS base
 
FROM base AS builder
 
RUN apk add --no-cache libc6-compat
RUN apk update && apk add --no-cache bash
RUN apk add openssl
RUN apk update
 
# Set working directory
WORKDIR /server
 
RUN apk add curl
RUN apk add openssl
RUN apk add bash
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
RUN apk add bash
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
RUN apk add bash
RUN apk add curl

RUN curl -fSL https://download.oracle.com/java/23/latest/jdk-23_linux-aarch64_bin.tar.gz -o /tmp/jdk.tgz \
    && tar -xzf /tmp/jdk.tgz -C /opt/ \
    && rm /tmp/jdk.tgz

ENV JAVA_HOME=/opt/jdk-23
ENV PATH="$JAVA_HOME/bin:${PATH}"

RUN curl -L https://github.com/hyperledger/besu/releases/download/25.1.0/besu-25.1.0.tar.gz -o /tmp/besu.tar.gz \
    && tar -xzf /tmp/besu.tar.gz -C /opt \
    && rm /tmp/besu.tar.gz

# 3) Make Besu available in PATH
ENV BESU_HOME=/opt/besu-25.1.0
ENV PATH="$BESU_HOME/bin:${PATH}"

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
 
USER fastify
 
COPY --from=installer /server .
 
EXPOSE 8000
 
CMD node apps/api/dist/index.js
