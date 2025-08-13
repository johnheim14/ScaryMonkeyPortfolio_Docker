# === Stage 1: Build the Tailwind CSS and assemble final files ===
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tailwind.config.js ./
RUN npm install

# Copy all source files
COPY src/ ./src/

# Run the build script to compile the CSS
RUN npm run build

# --- THIS IS THE NEW LINE ---
# Copy the index.html from src into the final dist directory
COPY src/index.html ./dist/


# === Stage 2: Serve the built files with NGINX ===
FROM nginx:alpine

# Copy the entire contents of the compiled 'dist' directory
# This now includes both index.html and the css folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]