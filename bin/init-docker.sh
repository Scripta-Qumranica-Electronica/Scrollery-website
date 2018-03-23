echo "Setting up docker container. This can take a few minutes depending on your network speed."

# clone the data repository
git clone https://github.com/Scripta-Qumranica-Electronica/Data-files.git ./tmp-data

# cd into the directory
cd ./tmp-data

# Cleanup up any images that might exist if running setup a second time
docker stop SQE_Database && docker rm SQE_Database

# Build the image
docker build -t sqe-maria:latest .

# start the container
docker run --name SQE_Database -e MYSQL_ROOT_PASSWORD=none -d -p 3307:3306 sqe-maria:latest

# Wait a minute or so to ensure the container is started, and the DB process is initialized
echo "waiting 45 seconds until container is ready ..."
sleep 45s

# ... then
# import the data
docker exec -i SQE_Database /tmp/import-docker.sh

# cleanup
cd .. && rm -Rf ./tmp-data
