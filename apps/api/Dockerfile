FROM node:18-slim AS base

FROM base AS builder

# In Debian, glibc is already present so libc6-compat is not needed.
RUN apt-get update && apt-get install -y bash openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /server

RUN apt-get update && apt-get install -y curl openssl bash && rm -rf /var/lib/apt/lists/*
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

# No need for libc6-compat in Debian; just update package lists.
RUN apt-get update && rm -rf /var/lib/apt/lists/*

WORKDIR /server

RUN apt-get update && apt-get install -y openssl curl bash && rm -rf /var/lib/apt/lists/*
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

# Install required packages using apt-get (glibc is built-in)
RUN apt-get update && apt-get install -y openssl openssh-client bash curl python3 python3-pip ca-certificates wget && rm -rf /var/lib/apt/lists/*

# Install Oracle JDK x64 Compressed Archive
RUN curl -fSL https://download.oracle.com/java/23/latest/jdk-23_linux-x64_bin.tar.gz -o /tmp/jdk.tgz \
    && mkdir -p /opt/jdk-23 \
    && tar -xzf /tmp/jdk.tgz -C /opt/jdk-23 --strip-components=1 \
    && rm /tmp/jdk.tgz

ENV JAVA_HOME=/opt/jdk-23
ENV PATH="$JAVA_HOME/bin:${PATH}"

RUN curl -L https://github.com/hyperledger/besu/releases/download/25.1.0/besu-25.1.0.tar.gz -o /tmp/besu.tar.gz \
    && tar -xzf /tmp/besu.tar.gz -C /opt \
    && rm /tmp/besu.tar.gz

# 3) Make Besu available in PATH
ENV BESU_HOME=/opt/besu-25.1.0
ENV PATH="$BESU_HOME/bin:${PATH}"

RUN curl -L https://s01.oss.sonatype.org/service/local/repositories/releases/content/net/consensys/quorum/tessera/tessera-dist/24.4.2/tessera-dist-24.4.2.tar -o /tmp/tessera.tar \
    && mkdir -p /opt/tessera-24.4.2 \
    && tar -xf /tmp/tessera.tar -C /opt/tessera-24.4.2 --strip-components=1 \
    && rm /tmp/tessera.tar

ENV TESSERA_HOME=/opt/tessera-24.4.2
ENV PATH="$TESSERA_HOME/bin:${PATH}"

RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

RUN pip3 install --break-system-packages eth-keys eth-utils
RUN pip3 install --break-system-packages pycryptodome

# Don't run production as root
RUN groupadd --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs fastify

USER fastify

COPY --from=installer /server .

EXPOSE 8000

CMD node apps/api/dist/index.js