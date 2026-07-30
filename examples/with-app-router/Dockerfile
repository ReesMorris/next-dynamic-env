# Build stage
FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.27.0

# Copy workspace root files
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY tsconfig.json ./

# Copy example app
COPY examples/with-app-router ./examples/with-app-router

# The standalone runtime always copies a public directory.
RUN mkdir -p examples/with-app-router/public

# Install the public-package consumer from the frozen workspace lockfile
RUN pnpm install --frozen-lockfile

# Build the example app
WORKDIR /app/examples/with-app-router
RUN pnpm build

# Runtime stage
FROM node:24-alpine
WORKDIR /app

# Copy standalone build
COPY --from=builder /app/examples/with-app-router/.next/standalone ./
COPY --from=builder /app/examples/with-app-router/.next/static ./examples/with-app-router/.next/static

# Copy public directory if it exists
COPY --from=builder /app/examples/with-app-router/public* ./examples/with-app-router/public/

EXPOSE 3000

# Set the correct working directory for standalone
WORKDIR /app/examples/with-app-router

CMD ["node", "server.js"]
