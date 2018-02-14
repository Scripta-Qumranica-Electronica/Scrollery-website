# Setup

The SQE Scrollery website depends on three components to function fully:

1. A local instance on the SQE MariaDB database.
2. A local installation of the Perl modules that provide a low level API to that database.
3. A local installation of the Scrollery website maintained in this repository.

## Summary

These instructions will walk you through installing the following on your development machine:
* Node 8.9.4
* Npm 5+
* Yarn
* Perl 5.18+
* Carton
* Docker

The development environment consists of the following components:

* A Docker container with a MariaDB instance and clean database dump.
* Perl CGI scripts to connect to the database
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

Install the SQE API to `/home/perl_libs`:

```bash
git clone https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API /home/perl_libs
``` 

If you're on a Mac, you'll likely need to follow the steps [here](https://stackoverflow.com/questions/1362703/how-can-i-use-the-home-directory-on-mac-os-x) in order to use the `/home` directory.  If you are on Linux you may need to run git clone as sudo, then `sudo chown -R $USER: /home/perl_libs`

By default, the library is configured to connect to the Docker container automatically. However, if you need, you can modify the file `/home/perl_libs/SQE_DB_APA/SQE_Restricted.pm` with your custom database credentials. Consult the [documentation for that repository](https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API) for details on how to do this.

## Client

**Prerequisites:**

* Most recent LTS Node version (currently 8.9.4), which can be downloaded [here](https://nodejs.org/en/download/)
* npm 5+ (bundled with Node)
* Yarn package manager

(Once npm is installed, run `npm install -g yarn` to install Yarn.)

* Recent version of Perl5 (tested working on 5.18.2 and 5.22.1)
* Depending on your system settings for Perl, you may need to run the following commands as sudo.
* You will need the MySQL client and developer libraries in order to compile the Perl database connector DBI::mysql.  The installation procedure for those libraries varies by operating system, most MySQL installation methods will create the necessary files; on Linux you must install the client and the development package (e.g., in Ubuntu `sudo apt install libmysqlclient-dev` should work if you do not already have MariaDB/Mysql client dev libraries installed), on Mac `brew install mariadb` should work if you use homebrew).  If DBI::mysql fails to compile or exits with errors when the cgi scripts are run, this may be due to an incompatability between DBI::mysql and the MariaDB client dev libs, please try installing Mysql (not MariaDB) dev libs and running `(sudo) carton install` again in the `resources/cgi-bin` folder.
* You will need the perl package Carton http://search.cpan.org/~miyagawa/Carton-v1.0.28/, installed via:
    * `(sudo) cpan Carton`
    * `(sudo) cpanm Carton`
    * Or in Ubuntu `sudo apt install carton`

Once installed, it should be available on your PATH: running `carton -v` should produce `carton v1.0.28` (or similar).

### Install Dependencies

# clone the Scrollery-website repository (if not already done)

```bash
git clone https://github.com/Scripta-Qumranica-Electronica/Scrollery-website.git
```

From the root of this repository (Scrollery-website), run the following command to locally install all npm dependencies:

```bash
yarn --pure-lockfile
```

From the `resources/cgi-bin` folder of this repository, run the following command to locally install all perl dependencies:

```bash
(sudo) carton install
```

### Build Client-Side Code

You have a few options, depending on your workflow:

##### `npm start`

Utilizes `webpack-hot-middleware` to achieve hot module reloading for all client-side assets. All files are watched and code rebuilt on changes; the changes will show up as soon as the Webpack build completes, without needing to refresh the browser.

Open up `http://localhost:9090` after running the command. This will run all requests to the Perl CGI scripts, bypassing your localhost (thus, it is not necessary to configure an Apache server!).

##### `npm run dev`

In order to use this option, you must first configure an Apache server to serve the `index.html` file at the root of this project and is capable of serving Perl CGI scripts from `resources/cgi-bin`. If you don't want to this this, simply use the previous option instead (`npm start`).

All files are watched for changes and rebuilt on changes. Open up the application from wherever you configured your server (e.g., `http://localhost/Scrollery-website`).

##### `npm run prod`

For production builds—which minify the assets, remove source maps, etc.—run `npm run prod`. This is not suitable for development purposes.

### Testing in Browser

After starting the development server with `npm start` or `npm run dev` and launching the SQE database Docker container (`docker start SQE-Database`), you can access the website at `localhost:9090`.  A default user for testing has already been installed to the database; the user name is `test` and the password is `asdf`.

### Note

One should shutdown the SQE database Docker after usage with `docker stop SQE-Database`. If not shut down properly, one will run into problems to restart the Docker after logging out. In this case, one may clean up the system using `docker rm $(docker ps -q -f status=exited)`.
