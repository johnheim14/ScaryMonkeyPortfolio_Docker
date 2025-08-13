# === Stage 1: Build the assets ===
FROM node:20-alpine as builder

WORKDIR /app

# --- OPTIMIZATION START ---
# 1. Copy only the package files first
COPY package*.json ./

# 2. Install dependencies. This layer will be cached as long as package.json doesn't change.
RUN npm install
# --- OPTIMIZATION END ---

# 3. Copy the rest of your project source code
COPY tailwind.config.js ./
COPY src/ ./src/

# 4. Run the build script to compile CSS
RUN npm run build

# 5. Assemble all final files into the /dist directory
COPY src/index.html ./dist/
COPY src/img ./dist/img/
COPY src/js ./dist/js/


# === Stage 2: Serve the built files with NGINX  ===
FROM nginx:alpine

# Copy the entire contents of the compiled 'dist' directory from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]