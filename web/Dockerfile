# Use the official NGINX image from Docker Hub
FROM nginx:alpine

COPY version.txt /usr/share/nginx/html/

# Copy the website files to the NGINX html directory
COPY . /usr/share/nginx/html

# Expose port 80 to the Docker host
EXPOSE 80

# Start NGINX when the container launches
CMD ["nginx", "-g", "daemon off;"]
