#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "Checking for npm..."
if which npm; then
    echo "${GREEN}✓ You have node/npm.${NC}"
else
    echo "${RED}✗ Error! You need node/npm, see: https://nodejs.org/en/download/${NC}" 1>&2 
    exit 64
fi

echo "Checking for docker..."
if which docker; then
    echo "${GREEN}✓ You have docker.${NC}"
else
    echo "${RED}✗ Error! You need docker, see: https://docs.docker.com/install/${NC}" 1>&2 
    exit 64
fi

echo "Checking for yarn..."
if which yarn; then
    echo "${GREEN}✓ You have yarn.${NC}"
else
    echo "${RED}✗ Error! You need yarn, see: https://yarnpkg.com/en/docs/install${NC}" 1>&2 
    exit 64
fi

echo "Checking for perl..."
if which perl; then
    echo "${GREEN}✓ You have perl.${NC}"
else
    echo "${RED}✗ Error! You need perl, see: https://www.perl.org/get.html${NC}" 1>&2 
    exit 64
fi

echo "Checking for carton..."
if which carton; then
    echo "${GREEN}✓ You have carton.${NC}"
else
    echo "${RED}✗ Error! You need carton, see: http://search.cpan.org/~miyagawa/Carton-v1.0.31/lib/Carton.pm${NC}" 1>&2 
    exit 64
fi