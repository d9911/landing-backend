# Etapa 1: Base image for building both frontend and backend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy root package.json (for scripts) and then frontend and backend
COPY package.json ./
COPY frontend ./frontend
COPY backend ./backend

# Install dependencies for frontend
WORKDIR /app/frontend
RUN yarn install --frozen-lockfile

# Build frontend
RUN yarn build

# Install dependencies for backend
WORKDIR /app/backend
RUN yarn install --frozen-lockfile

# Build backend (TypeScript to JS)
RUN yarn build

# Etapa 2: Final image with nginx and PM2
FROM node:18-alpine

# Install nginx and pm2
RUN apk add --no-cache nginx && \
    npm install -g pm2

# Create app directory
WORKDIR /app

# Copy built artifacts and node_modules from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy ecosystem.config.js and nginx.conf from root
COPY ecosystem.config.js ./ecosystem.config.js
COPY nginx.conf ./nginx.conf

# Configure nginx: replace the default nginx.conf with our custom one
RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports: 3000 for nginx, 3001 for backend (if needed for direct access, but we proxy via nginx)
EXPOSE 3000 3001

# Use pm2-runtime to start the application (which will run both nginx and backend)
# The ecosystem.config.js defines two apps: nginx and backend.
CMD ["pm2-runtime", "start", "ecosystem.config.js"]