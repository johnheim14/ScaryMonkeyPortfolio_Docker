#!/bin/sh

# This script runs every time the container starts.
# It ensures file permissions are correct before Nginx launches.

echo "Forcing ownership and permissions for /usr/share/nginx/html..."
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html
echo "Permissions set successfully."

# Now, execute the original Nginx entrypoint script
exec /docker-entrypoint.sh nginx -g 'daemon off;'
