# Stage 1: Pre-built dist (copy from local build)
FROM node:20-slim AS dist-stage
WORKDIR /dist
COPY dist ./html

# Stage 2: Production Runtime
FROM node:20-slim
WORKDIR /app

# Install Nginx
RUN apt-get update && apt-get install -y nginx procps curl && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY packages/backend/package.json ./packages/backend/

RUN npm install --production --omit=dev --legacy-peer-deps

COPY packages/backend ./packages/backend/

# Copy pre-built dist
COPY --from=dist-stage /dist/html /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script
RUN echo '#!/bin/bash\n\
  set -e\n\
  nginx -t\n\
  nginx\n\
  cd /app\n\
  node packages/backend/centralSequence.js > /var/log/backend.log 2>&1 &\n\
  tail -f /var/log/backend.log' > /start.sh && chmod +x /start.sh

EXPOSE 80 8008

CMD ["/start.sh"]
