# Stage 1: Build the frontend assets
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source
COPY . .

# Run the build script to generate CSS
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Clean out the default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the HTML, images, and JS from the src directory's contents
COPY --from=builder /app/src/. /usr/share/nginx/html/

# Copy the compiled CSS from the dist directory
COPY --from=builder /app/dist/css /usr/share/nginx/html/css

EXPOSE 80
