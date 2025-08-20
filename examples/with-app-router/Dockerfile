# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace root files
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY tsconfig.json ./

# Copy packages
COPY packages ./packages

# Copy example app
COPY examples/with-app-router ./examples/with-app-router

# Install all dependencies (needed for workspace)
RUN pnpm install --frozen-lockfile

# Build the library package
WORKDIR /app/packages/next-dynamic-env
RUN pnpm build

# Build the example app
WORKDIR /app/examples/with-app-router
RUN pnpm build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Copy standalone build
COPY --from=builder /app/examples/with-app-router/.next/standalone ./
COPY --from=builder /app/examples/with-app-router/.next/static ./examples/with-app-router/.next/static

# Copy public directory if it exists
COPY --from=builder /app/examples/with-app-router/public* ./examples/with-app-router/public/

EXPOSE 3000

# Set the correct working directory for standalone
WORKDIR /app/examples/with-app-router

# Set default PORT if not provided
ENV PORT=3000

CMD ["node", "server.js"]