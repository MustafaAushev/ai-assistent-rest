# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile
COPY tsconfig.json ./

RUN yarn build

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S dev -u 1001

# Switch to non-root user
USER dev

# Expose port
EXPOSE 3005

# Start the application
CMD ["node", "dist/main.js"]