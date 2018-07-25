# Contents
- [Contents](#contents)
- [Quick Start Instructions](#quick-start-instructions)
- [Full Setup Description](#full-setup-description)
  - [Summary (currently deprecated, use the quick instructions for now)](#summary-currently-deprecated-use-the-quick-instructions-for-now)
  - [Server Side](#server-side)
    - [Build Server Side Code](#build-server-side-code)
  - [Client](#client)
    - [Install Dependencies](#install-dependencies)
      - [Clone the Scrollery-website repository (if not already done)](#clone-the-scrollery-website-repository-if-not-already-done)
      - [Install website dependencies](#install-website-dependencies)
      - [Install SQE_API](#install-sqe_api)
      - [Build the Perl cgi script dependencies](#build-the-perl-cgi-script-dependencies)
    - [Starting up the server for development or production](#starting-up-the-server-for-development-or-production)
        - [`npm start`](#npm-start)
        - [`npm run dev`](#npm-run-dev)
        - [`npm run prod`](#npm-run-prod)
    - [Testing in Browser](#testing-in-browser)
    - [Note](#note)

# Quick Start Instructions
The Scrollery-website comes with a quick start script.  In order to run it, you must already have installed the following dependencies:
* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [Node 8.9.4](https://nodejs.org/en/download/)
* Npm 5+ (bundled with node)
* [Yarn](https://yarnpkg.com/en/docs/install)
* [Docker](https://docs.docker.com/install/)

If you have all these dependencies installed and agree to using project's the default settings (see descriptions below), then you can simply run the install script to download all necessary packages and build the database.  Make sure Docker is running (and is fully started), open a terminal and run:

```bash
#clone the Scrollery website project
git clone https://github.com/Scripta-Qumranica-Electronica/Scrollery-website.git

#enter the project folder
cd Scrollery-website

#built the project (can take several minutes)
#you can build the full environment `bootstrap`
#or load a minimal environment `bootstrap:min`
yarn run bootstrap
#or
yarn run bootstrap:min

#launch the website
yarn start
```

If everything runs with no errors, then after executing `yarn start` to launch the website you can navigate to [localhost:9090](http://localhost:9090) in your browser and test it out.  The CGI requests provided in this project are ducumented in [CGI-Functions.md](./CGI-Functions.md).  Documentation for the database structure can be found in the [Data-files project documentation](https://github.com/Scripta-Qumranica-Electronica/Data-files/blob/master/docs/Database-structure.md).

You may also run `yarn run bootstrap` again after pulling down a new version of the Scrollery-website, and it will make any necessary updates to the dependencies and the database <span style="color:red">(Warning!!! this will overwrite your existing SQE_DEV database)</span>.  If you suspect the development database has become corrupt, you can always reset it to defaults with `yarn run reset:db`.  After running several times, you may find that your Docker runs out of space, I have found the suggestions [here](https://lebkowski.name/docker-volumes/) to be helpful in such circumstances.

You should use `docker-compose stop` to shutdown the SQE Docker containers before rebooting your system, otherwise you may have trouble using it after reboot. In that case, you may clean up the system using `docker rm $(docker ps -q -f status=exited)`, and then start the Docker contiainers again with `docker-compose up` or `docker-compose start`.

# Full Setup Description

The SQE Scrollery website depends on three components to function fully:

1. [A local instance on the SQE MariaDB database.](https://github.com/Scripta-Qumranica-Electronica/Data-files)
2. [A local installation of the Perl modules that provide a low level API to that database.](https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API)
3. A local installation of the Scrollery website maintained in this repository.

## Summary (currently deprecated, use the quick instructions for now)

These instructions will walk you through programs and settings involved in running the Scrollery website.  The following dependencies are required:
* [Node 8.9.4](https://nodejs.org/en/download/)
* Npm 5+ (bundled with node)
* [Yarn](https://yarnpkg.com/en/docs/install)
* [Perl 5.18+](https://www.perl.org/get.html)
* [Carton](http://search.cpan.org/~miyagawa/Carton-v1.0.31/lib/Carton.pm)
    * `(sudo) cpan Carton`
    * `(sudo) cpanm Carton`
    * Or in Ubuntu `sudo apt install carton`
* MariaDB/mysql libraries (for Perl's [DBD::mysql](http://search.cpan.org/dist/DBD-mysql/lib/DBD/mysql.pm))
    * Ubuntu `sudo apt install libmysqlclient-dev`
    * Mac `brew install MariaDB` (If you run into problems, perhaps try https://dev.mysql.com/downloads/connector/c/ or `brew install mysql-connector-c`)
* [Docker](https://docs.docker.com/install/)

The development environment consists of the following components:

* A Docker container with a MariaDB instance and clean database dump.
* Perl CGI API to connect to the database
* Node HTTP server + Webpack build process

## Server Side

**Prerequisites**

You will need a working [Docker installation](https://docs.docker.com/install/) to spin up the SQE database.

### Build Server Side Code

Install the SQE database Docker Image:

```bash
# clone the data repository
git clone https://github.com/Scripta-Qumranica-Electronica/Data-files.git

# cd into the directory
cd Data-files

# Build the image
docker build -t sqe-maria:latest .

# start the container
docker run --name SQE_Database -e MYSQL_ROOT_PASSWORD=none -d -p 3307:3306 sqe-maria:latest

# Wait a minute or so to ensure the container is started, and the DB process is initialized

# ... then
# import the data
docker exec -i SQE_Database /tmp/import-docker.sh
```

Note that you can always run `npm run setup:db` from the root of the project, which will build and start the docker container for you with the default setting.

## Client

**Prerequisites:**

* Most recent LTS Node version (currently 8.9.4), which can be downloaded [here](https://nodejs.org/en/download/), but also check for a system specific install.
* npm 5+ (bundled with Node)
* Yarn package manager, which can be downloaded [here](https://yarnpkg.com/en/docs/install)
* Recent version of Perl5 (tested working on 5.18.2 and 5.22.1)
* Depending on your system settings for Perl, you may need to run the following commands as sudo.
* You will need the MySQL client and developer libraries in order to compile the Perl database connector DBI::mysql.  The installation procedure for those libraries varies by operating system, most MySQL installation methods will create the necessary files; on Linux you must install the client and the development package (e.g., in Ubuntu `sudo apt install libmysqlclient-dev` should work if you do not already have MariaDB/Mysql client dev libraries installed), on Mac `brew install mariadb` should work if you use homebrew).  If DBI::mysql fails to compile or exits with errors when the cgi scripts are run, this may be due to an incompatability between DBI::mysql and the MariaDB client dev libs, please try installing Mysql (not MariaDB) dev libs and running `(sudo) carton install` again in the `resources/cgi-bin` folder.
* You will need the perl package Carton http://search.cpan.org/~miyagawa/Carton-v1.0.28/, installed via:
    * `(sudo) cpan Carton`
    * `(sudo) cpanm Carton`
    * Or in Ubuntu `sudo apt install carton`

Once installed, it should be available on your PATH: running `carton -v` should produce `carton v1.0.28` (or similar).

### Install Dependencies

#### Clone the Scrollery-website repository (if not already done)

```bash
git clone https://github.com/Scripta-Qumranica-Electronica/Scrollery-website.git
```

#### Install website dependencies

From the root of this repository `./Scrollery-website`, run the following command to locally install all npm dependencies:

```bash
yarn --pure-lockfile
```

#### Install SQE_API

From the root of this repository `./Scrollery-website`, install the SQE API to `./Scrollery-website/resources/perl-libs`:

```bash
git clone https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API resources/perl-libs
```

By default, the library is configured to connect to the Docker container automatically. However, if you need, you can modify the file `./resources/perl-libs/SQE_Restricted.pm` with your custom database credentials. Consult the [documentation for that repository](https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API) for details on how to do this.

#### Build the Perl cgi script dependencies

From the `./Scrollery-website/resources/cgi-bin` folder of this repository, run the following command to locally install all perl dependencies:

```bash
(sudo) carton install
```

### Starting up the server for development or production

You have a few options, depending on your workflow:

##### `npm start`

This is the easiest approach.  It utilizes `webpack-hot-middleware` to achieve hot module reloading for all client-side assets. All files are watched and code is rebuilt in realtime on changes; the changes will show up as soon as the Webpack rebuild completes, without needing to refresh the browser.

Open up `http://localhost:9090` after running the command. This will run all requests to the Perl CGI scripts, bypassing your localhost (thus, it is not necessary to configure an Apache server!).

##### `npm run dev`

In order to use this option, you must first configure a webserver such as Apache to serve the `index.html` file at the root of this project and to execute the Perl CGI scripts from `resources/cgi-bin`. If you don't want to this this, simply use the previous option instead (`npm start`).

All files are watched for changes and rebuilt on changes. Open up the application from wherever you configured your server (e.g., `http://localhost/Scrollery-website`).

##### `npm run prod`

For production builds—which minify the assets, remove source maps, etc.—run `npm run prod`. This is not suitable for development purposes.  The compiled files will be in the `dist` folder.  To install these on a web server you will need to copy `index.html`, the `dist` folder, and the `resources` folder into a folder on your webserver.  You will the need to set up the webserver to execute cgi scripts in the `resources/cgi-scripts` folder, and you may need to change line 7 of `scrollery-cgi.pl`, `use lib qw(../perl-libs);`, to point to the absolute path of `resources/perl-libs` on your webserver, and not the relative path that it uses for development mode.

### Testing in Browser

After starting the development server with `npm start` or `npm run dev` and launching the SQE database Docker container (`docker start SQE-Database`), you can access the website at `localhost:9090`.  A default user for testing has already been installed to the database; the user name is `test` and the password is `asdf`.

### Note

One should shutdown the SQE database Docker after usage with `docker stop SQE-Database`. If not shut down properly, one will run into problems to restart the Docker after logging out. In this case, one may clean up the system using `docker rm $(docker ps -q -f status=exited)`.
