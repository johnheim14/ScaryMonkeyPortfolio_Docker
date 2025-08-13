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

# Create the entrypoint script directly inside the Dockerfile.
# This avoids COPY errors and dependency on external files.
RUN <<EOF > /entrypoint.sh
#!/bin/sh
echo
echo "##############################################"
echo "##    RUNNING INLINE ENTRYPOINT SCRIPT      ##"
echo "##############################################"
echo
echo "Forcing ownership and permissions..."
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html
echo "Permissions set successfully."
echo "Handing over to Nginx..."
exec /docker-entrypoint.sh nginx -g 'daemon off;'
EOF

# Make the newly created script executable
RUN chmod +x /entrypoint.sh

EXPOSE 80
