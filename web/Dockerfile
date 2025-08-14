# === Stage 1: Build the assets ===
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy only the package files first
COPY package*.json ./

# 2. Install dependencies. This layer will be cached as long as package.json doesn't change.
RUN npm install

# 3. Copy the rest of your project source code and config files
# THIS IS THE FIX: Copy all config files needed for the build
COPY tailwind.config.js postcss.config.js vite.config.js ./
COPY src/ ./src/

# 4. Run the build script (now using Vite)
RUN npm run build


# === Stage 2: Serve the built files with NGINX ===
FROM nginx:alpine

# Copy the entire contents of the compiled 'dist' directory from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
