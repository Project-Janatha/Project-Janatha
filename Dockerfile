# Stage 1: Build Frontend
# Use 'slim' (Debian) instead of 'alpine' for better native module compatibility
FROM node:20-slim AS frontend-builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package files
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

# Install ALL dependencies
# We use --legacy-peer-deps to avoid conflicts, but ensure all packages install
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Frontend
WORKDIR /app/packages/frontend
ENV EXPO_PUBLIC_API_URL=/api
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=1

# Disable Watchman and telemetry to prevent hanging
ENV EXPO_NO_TELEMETRY=1
ENV WATCHMAN_DISABLE_RECRAWL=1
ENV EXPO_NO_DOTENV=1

# Build command with minify disabled for faster builds
RUN npx expo export --platform web --output-dir dist --clear --no-minify

# Stage 2: Production Runtime
FROM node:20-slim
WORKDIR /app

# Install Nginx & PM2
# Note: apt-get is used in slim images instead of apk
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*
RUN npm install -g pm2

# Copy package files
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/

# Install production dependencies
RUN npm install --production --legacy-peer-deps

# Copy Backend Code
COPY packages/backend ./packages/backend/

# Copy Frontend Build from Stage 1
COPY --from=frontend-builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy Nginx Config
COPY nginx.conf /etc/nginx/sites-available/default

EXPOSE 80

# Start Nginx and Backend
CMD ["sh", "-c", "service nginx start && pm2-runtime start packages/backend/centralSequence.js"]