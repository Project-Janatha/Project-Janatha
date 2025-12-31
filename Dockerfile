# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

RUN npm install --legacy-peer-deps

COPY . .

WORKDIR /app/packages/frontend
ENV EXPO_PUBLIC_API_URL=/api
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=1
ENV EXPO_NO_TELEMETRY=1
ENV WATCHMAN_DISABLE_RECRAWL=1
ENV EXPO_NO_DOTENV=1

RUN npx expo export --platform web --output-dir dist --clear --no-minify

# Stage 2: Production Runtime
FROM node:20-slim
WORKDIR /app

# Install Nginx and debugging tools
RUN apt-get update && apt-get install -y nginx procps curl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/

RUN npm install --production --legacy-peer-deps

COPY packages/backend ./packages/backend/

COPY --from=frontend-builder /app/packages/frontend/dist /usr/share/nginx/html

# Inject Leaflet CSS CDN link into index.html after </head>
RUN sed -i 's|</head>|<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/></head>|' /usr/share/nginx/html/index.html

COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script with better error handling
RUN echo '#!/bin/bash\n\
  set -e\n\
  \n\
  echo "=== Starting Services ==="\n\
  echo "Environment variables:"\n\
  env | grep -E "AWS|PORT|TABLE|NODE_ENV" || echo "No relevant env vars found"\n\
  \n\
  echo ""\n\
  echo "Starting Nginx..."\n\
  nginx -t\n\
  nginx\n\
  echo "✅ Nginx started"\n\
  \n\
  echo ""\n\
  echo "Starting Node.js backend on port 8008..."\n\
  cd /app\n\
  node packages/backend/centralSequence.js > /var/log/backend.log 2>&1 &\n\
  NODE_PID=$!\n\
  echo "✅ Backend started with PID $NODE_PID"\n\
  \n\
  # Wait a bit and check if backend is still running\n\
  sleep 3\n\
  if ps -p $NODE_PID > /dev/null; then\n\
  echo "✅ Backend is running"\n\
  echo "Backend logs:"\n\
  cat /var/log/backend.log\n\
  else\n\
  echo "❌ Backend failed to start!"\n\
  echo "Backend logs:"\n\
  cat /var/log/backend.log\n\
  exit 1\n\
  fi\n\
  \n\
  # Keep container running\n\
  echo ""\n\
  echo "=== Services Started Successfully ==="\n\
  echo "Nginx: http://localhost:80"\n\
  echo "Backend: http://localhost:8008"\n\
  echo ""\n\
  echo "Tailing backend logs..."\n\
  tail -f /var/log/backend.log' > /start.sh && chmod +x /start.sh

EXPOSE 80 8008

CMD ["/start.sh"]