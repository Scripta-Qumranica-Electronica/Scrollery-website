#!/bin/bash

awk -F "\"*,\"*" '{print $1}' /usr/local/apache2/htdocs/resources/cgi-bin/cpanfile | sed 's/requires "//' | xargs cpanm -f