#!/bin/sh

# update packages
yum update -y

# install apache and register it as a service
yum install -y httpd
systemctl start httpd
systemctl enable httpd

# obtain the local hostname
PUBLIC_HOST_NAME=$(curl --silent http://169.254.169.254/latest/meta-data/public-hostname)

echo "<html><body><h1>Hello world from ${PUBLIC_HOST_NAME}</h1></body></html>" > /var/www/html/index.html
