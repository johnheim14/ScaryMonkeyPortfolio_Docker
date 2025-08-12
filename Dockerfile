FROM node:18-alpine AS builder

# Set work directory
WORKDIR /app

# Copy package.json first for dependency caching
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build Tailwind CSS
RUN npm run build

# ---- Serve with nginx ----
FROM nginx:alpine

# Remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled site from builder
COPY --from=builder /app/src /usr/share/nginx/html
COPY --from=builder /app/dist/css /usr/share/nginx/html/css

# Copy your HTML, images, and JS
COPY --from=builder /app/src/img /usr/share/nginx/html/img
COPY --from=builder /app/src/js /usr/share/nginx/html/js

# Expose port
EXPOSE 80
