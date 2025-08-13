# === Stage 1: Build the Tailwind CSS ===
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tailwind.config.js ./
RUN npm install

# Copy all source files
COPY src/ ./src/

# Run the build script defined in package.json
RUN npm run build


# === Stage 2: Serve the built files with NGINX ===
FROM nginx:alpine

# Copy the compiled HTML and CSS from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]