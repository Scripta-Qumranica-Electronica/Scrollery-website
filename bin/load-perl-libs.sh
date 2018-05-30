#!/bin/bash

while getopts ":v:" opt; do
    case "${opt}" in
    v)  version=$OPTARG
        ;;
    esac
done

echo "Checking for perl-libs repository."
if [ -d "../resources/perl-libs/.git" ];
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
