FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Make sure dist exists to avoid mkdir errors
RUN mkdir -p dist/css

RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/src /usr/share/nginx/html
COPY --from=builder /app/dist/css /usr/share/nginx/html/css
COPY --from=builder /app/src/img /usr/share/nginx/html/img
COPY --from=builder /app/src/js /usr/share/nginx/html/js

EXPOSE 80
