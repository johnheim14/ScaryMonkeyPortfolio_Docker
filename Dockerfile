# Stage 1: Build the frontend assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Clean out the default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the built assets and static files
COPY --from=builder /app/src/. /usr/share/nginx/html/
COPY --from=builder /app/dist/css /usr/share/nginx/html/css

# Copy our custom entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set our script as the container's entrypoint
ENTRYPOINT ["/entrypoint.sh"]
