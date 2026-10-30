# === Stage 1: Build the assets ===
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copy only the package files first
COPY package.json package-lock.json ./

# 2. Install exact locked dependencies. This layer is cached as long as the lockfile doesn't change.
RUN npm ci

# 3. Copy the config files and source needed for the build
COPY tailwind.config.js postcss.config.js vite.config.js ./
COPY src/ ./src/

# 4. Run the build script (Vite)
RUN npm run build


# === Stage 2: Serve the built files with NGINX ===
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the entire contents of the compiled 'dist' directory from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
