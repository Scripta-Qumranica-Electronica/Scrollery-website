#!/bin/bash

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -v|--version)
    version="$2"
    shift # past argument
    shift # past value
    ;;
esac
done

echo "Checking for existing perl-libs..."
if [ -d "../resources/perl-libs" ]; then
  echo "Removing old perl-libs..."
  rm -rf ../resources/perl-libs
fi

git clone https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API.git ../resources/perl-libs -b ${version}

