#!/bin/bash

while getopts ":v:" opt; do
    case "${opt}" in
    v)  version=$OPTARG
        ;;
    esac
done

echo "Checking for existing perl-libs..."
if [ -d "../resources/perl-libs" ]; then
  echo "Removing old perl-libs..."
  rm -rf ../resources/perl-libs
fi

echo "Checking for Data_Files repository."
if [ -d "../resources/perl-libs" ];
then
    echo "Fetching changes."
    cd ../resources/perl-libs
    git fetch
else
    echo "Cloning repository."
    git clone https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API.git ../resources/perl-libs
    # cd into the directory
    cd ../resources/perl-libs
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
