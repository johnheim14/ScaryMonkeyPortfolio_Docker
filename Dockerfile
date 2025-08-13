# Stage 1: Build the frontend assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- ADD THIS DEBUGGING LINE ---
RUN echo "--- Checking tailwind.config.js at build time ---" && cat tailwind.config.js

# This is your existing build command
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# The rest of your Dockerfile remains the same...
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/src/. /usr/share/nginx/html/
COPY --from=builder /app/dist/css /usr/share/nginx/html/css

EXPOSE 80
