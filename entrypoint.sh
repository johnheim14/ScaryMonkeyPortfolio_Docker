#!/bin/sh

echo
echo "##############################################"
echo "##     RUNNING CUSTOM ENTRYPOINT SCRIPT     ##"
echo "##############################################"
echo

# Set ownership and permissions for the web content
echo "Forcing ownership and permissions for /usr/share/nginx/html..."
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html
echo "Permissions set successfully."

# Now, execute the original Nginx entrypoint script
echo "Handing over to Nginx..."
exec /docker-entrypoint.sh nginx -g 'daemon off;'
