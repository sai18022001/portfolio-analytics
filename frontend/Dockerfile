# Frontend Dockerfile — two stage build
#
# Stage 1 (build): uses Node to compile TypeScript + React into plain HTML/CSS/JS
# Stage 2 (serve): uses nginx (a lightweight web server) to serve those static files
#
# Why two stages? The Node image is ~1GB. The final nginx image is ~20MB.
# We use Node to build, then throw it away and only keep the output files.

# --- Stage 1: Build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (same caching trick as backend)
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build
# This creates a /app/dist folder with plain HTML/CSS/JS files

# --- Stage 2: Serve ---
FROM nginx:alpine

# Copy the built files from stage 1 into nginx's serving folder
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx serves on port 80 by default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]