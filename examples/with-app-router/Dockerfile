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

# Install pnpm
RUN npm install -g pnpm

# Copy built app and necessary files
COPY --from=builder /app/examples/with-app-router/.next ./.next
COPY --from=builder /app/examples/with-app-router/public ./public
COPY --from=builder /app/examples/with-app-router/package.json ./
COPY --from=builder /app/examples/with-app-router/node_modules ./node_modules

# Copy the built library (needed for runtime)
COPY --from=builder /app/packages/next-dynamic-env/dist ./node_modules/next-dynamic-env/dist
COPY --from=builder /app/packages/next-dynamic-env/package.json ./node_modules/next-dynamic-env/

EXPOSE 3000

CMD ["pnpm", "start"]