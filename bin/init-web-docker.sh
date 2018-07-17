# Cleanup up any images that might exist if running setup a second time
echo "Cleaning up any past instances."
docker stop SQE_CGI && docker rm SQE_CGI

# Build the image
echo "Building the new docker container."
docker build -t sqe-cgi:latest .

# start the container
echo "Starting the new container."
docker run --name SQE_CGI -d -p 9080:80 -v "$(pwd)"/resources/cgi-bin/:/usr/local/apache2/htdocs/resources/cgi-bin/ -v "$(pwd)"/resources/perl-libs/:/usr/local/apache2/htdocs/resources/perl-libs/ --network=SQE sqe-cgi:latest

# Wait a minute or so to ensure the container is started, and the DB process is initialized
echo "waiting until container is ready ..."
docker container list | grep "SQE_CGI"
while [ $? != 0 ]
do
sleep 1s
echo "not started yet ..."
docker container list | grep "SQE_Database"
done
echo "Container is ready."

# Load all the Perl modules
echo "Loading Perl modules ..."
docker exec -i SQE_CGI /tmp/load-perl-deps.sh