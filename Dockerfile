# Etapa 1: Base image for building both frontend and backend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock (or package-lock) for both frontend and backend
# We have a root package.json? Actually, we have separate package.json in frontend and backend.
# Let's copy the root package.json (if exists) and then the frontend and backend directories.
# However, note that the root package.json is for the whole project (ai-interface) and only has scripts.
# We'll copy the entire project and then install dependencies in each subdirectory.

# First, copy the root package.json and yarn.lock (if any) for the root scripts (though not needed for build)
COPY package.json yarn.lock ./
# Copy frontend and backend directories
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

# Copy built artifacts from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Copy ecosystem.config.js and nginx.conf
COPY ecosystem.config.js ./ecosystem.config.js
COPY nginx.conf ./nginx.conf

# Configure nginx: copy our nginx.conf to the nginx default config location
# We'll remove the default and put ours.
RUN rm /etc/nginx/http.d/default.conf
COPY nginx.conf /etc/nginx/http.d/app.conf

# Expose ports: 80 for nginx, 3001 for backend (if needed for direct access, but we proxy via nginx)
EXPOSE 80 3001

# Use pm2-runtime to start the application (which will run both nginx and backend)
# The ecosystem.config.js defines two apps: nginx and backend.
CMD ["pm2-runtime", "start", "ecosystem.config.js"]