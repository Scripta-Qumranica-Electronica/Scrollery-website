[![Build Status](https://travis-ci.org/Scripta-Qumranica-Electronica/Scrollery-website.svg?branch=master)](https://travis-ci.org/Scripta-Qumranica-Electronica/Scrollery-website)
[![Coverage Status](https://coveralls.io/repos/github/Scripta-Qumranica-Electronica/Scrollery-website/badge.svg?branch=master)](https://coveralls.io/github/Scripta-Qumranica-Electronica/Scrollery-website?branch=master)

# Scrollery-website
This is a develpoment space for the SQE website.  It is currently in its earliest stages of development, but we hope that hosting it here will streamline the process of development.

## Development procedures
The website is currently under heavy development, but a few words are in order about design principles that will aid in the growth of the project.  We aim to make the site as modular as possible so that layout and functionality can be more easily altered, updated, and debugged.  To that end we have adopted the Javascript framework Vue.js, and have made heavy use of atomized componenents.

For the purposes of debugging, we have adopted a rigorous unit testing system (see the ./tests folder) using Karma/Mocha/Chai/Sinon/vue-test-utils using Istanbul to monitor code coverage and Coveralls for insight.  This Github project monitors the code coverage on pull requests and will fail on builds with insufficient coverage (so please write your tests).

## Installation
This website depends on a separate set of Perl modules that provide a low-level API and a separately maintained database that can be run in a Docker container.  Both of these must be present on the system and the database Docker container must be running for the website to function.  Please follow the installation instructions [here](./docs/SETUP.md)
