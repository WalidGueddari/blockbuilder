FROM node:22-slim AS base

FROM base AS builder

RUN apt-get update && apt-get install -y bash openssl curl && rm -rf /var/lib/apt/lists/*

WORKDIR /server

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN pnpm dlx turbo prune api --docker

COPY . .

RUN turbo prune api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

WORKDIR /server

RUN apt-get update && apt-get install -y openssl curl bash && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN pnpm add -g turbo

COPY .gitignore .gitignore
COPY --from=builder /server/out/json/ .
COPY --from=builder /server/out/pnpm-lock.yaml ./pnpm-lock.yaml

COPY --from=builder /server/out/full/ .
COPY turbo.json turbo.json

RUN pnpm install

RUN turbo build --filter=@saas-monorepo/database
RUN pnpm dlx turbo build --filter=api

FROM base AS runner

WORKDIR /server

# Install required packages using apt-get (glibc is built-in)
RUN apt-get update && apt-get install -y openssl openssh-client bash curl python3 python3-pip ca-certificates wget && rm -rf /var/lib/apt/lists/*

# Install Oracle JDK x64 Compressed Archive
RUN curl -fSL https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz -o /tmp/jdk.tgz \
    && mkdir -p /opt/jdk-21 \
    && tar -xzf /tmp/jdk.tgz -C /opt/jdk-21 --strip-components=1 \
    && rm /tmp/jdk.tgz

ENV JAVA_HOME=/opt/jdk-21
ENV PATH="$JAVA_HOME/bin:${PATH}"

RUN curl -L https://github.com/hyperledger/besu/releases/download/24.10.0/besu-24.10.0.tar.gz -o /tmp/besu.tar.gz \
    && tar -xzf /tmp/besu.tar.gz -C /opt \
    && rm /tmp/besu.tar.gz

# 3) Make Besu available in PATH
ENV BESU_HOME=/opt/besu-24.10.0
ENV PATH="$BESU_HOME/bin:${PATH}"

RUN curl -L "https://repo1.maven.org/maven2/net/consensys/quorum/tessera/tessera-dist/24.4.2/tessera-dist-24.4.2.tar" -o /tmp/tessera.tar \
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