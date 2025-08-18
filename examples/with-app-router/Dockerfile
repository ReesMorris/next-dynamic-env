# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

# Copy library source
COPY src ./src

# Copy example app
COPY examples/with-app-router ./examples/with-app-router

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build library first
RUN pnpm build

# Build the example app
WORKDIR /app/examples/with-app-router
RUN pnpm build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Copy built app
COPY --from=builder /app/examples/with-app-router/.next ./.next
COPY --from=builder /app/examples/with-app-router/public ./public
COPY --from=builder /app/examples/with-app-router/package.json ./

# Install production dependencies only
RUN npm install -g pnpm
RUN pnpm install --prod

EXPOSE 3000

CMD ["pnpm", "start"]