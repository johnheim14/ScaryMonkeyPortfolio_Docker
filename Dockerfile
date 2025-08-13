# Use a simple, lightweight web server
FROM nginx:alpine

# Copy the entire contents of your finished build folder 
# to the web server's public directory.
COPY ./dist /usr/share/nginx/html

EXPOSE 80
