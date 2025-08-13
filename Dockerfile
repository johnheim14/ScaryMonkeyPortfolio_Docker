# Use a simple Nginx image
FROM nginx:alpine

# Copy your website's HTML, JS, and image files
COPY ./src /usr/share/nginx/html

# Copy your pre-built CSS file
COPY ./dist/css /usr/share/nginx/html/css

EXPOSE 80
