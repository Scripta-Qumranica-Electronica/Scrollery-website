# Cleanup up any images that might exist if running setup a second time
echo "Cleaning up any past instances."
docker stop SQE_CGI && docker rm SQE_CGI

# start the container
echo "Starting the new container."
docker pull bronsonbdevost/cgi-web-server:devel
docker run --name SQE_CGI -d -p 9080:80 -v "$(pwd)"/resources/cgi-bin/:/usr/local/apache2/htdocs/resources/cgi-bin/ -v "$(pwd)"/resources/perl-libs/:/usr/local/apache2/htdocs/resources/perl-libs/ --network=SQE bronsonbdevost/cgi-web-server:devel

# Wait a minute or so to ensure the container is started, and the DB process is initialized
echo "waiting until container is ready ..."
docker container list | grep "SQE_CGI"
while [ $? != 0 ]
do
sleep 1s
echo "not started yet ..."
docker container list | grep "SQE_CGI"
done
echo "Container is ready."