#!/bin/bash

#TODO maybe add error checking to several of the steps: if [ $? != 0]; then ... fi

while getopts "v:" opt; do
    case "$opt" in
    v)  version=$OPTARG
        ;;
    esac
done

echo "Setting up docker container. This can take a few minutes depending on your network speed."

# clone the data repository
echo "Checking for Data_Files repository."
if [ -d "../resources/data-files" ];
then
    echo "Fetching changes."
    cd ../resources/data-files
    git fetch
else
    echo "Cloning repository."
    git clone https://github.com/Scripta-Qumranica-Electronica/Data-files.git ../resources/data-files
    # cd into the directory
    cd ../resources/data-files
fi

echo "Checking for desired version"
if [ -n "${version}" ];
then
    echo "Checking out tag ${version}."
    git checkout ${version}
else
    echo "Checking out latest master."
    git checkout master
    git pull origin master
fi

# Cleanup up any images that might exist if running setup a second time
echo "Cleaning up any past instances."
docker stop SQE_Database && docker rm SQE_Database

# Build the image
echo "Building the new docker container."
docker build -t sqe-maria:latest .

# start the container
echo "Starting the new container."
docker run --name SQE_Database -e MYSQL_ROOT_PASSWORD=none -d -p 3307:3306 sqe-maria:latest

# Wait a minute or so to ensure the container is started, and the DB process is initialized
echo "waiting until container is ready ..."
docker container list | grep "SQE_Database"
while [ $? != 0 ]
do
sleep 1s
echo "not started yet ..."
docker container list | grep "SQE_Database"
done

# Note, you may hit an infinite loop if something went wrong
# with the Docker setup.
echo "waiting until database is ready for connections..."
docker exec -i SQE_Database /usr/bin/mysql --host=127.0.0.1  --user=root --password=none -e "CREATE DATABASE IF NOT EXISTS SQE_DEV DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci"
while [ $? != 0 ]
do
sleep 1s
echo "database not ready yet ..."
docker exec -i SQE_Database /usr/bin/mysql --host=127.0.0.1  --user=root --password=none -e "CREATE DATABASE IF NOT EXISTS SQE_DEV DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci"
done

# ... then
# import the data
echo "Building the database."
docker exec -i SQE_Database /tmp/import-docker.sh

# cleanup
# cd .. && rm -Rf ./tmp-data
cd ../../bin