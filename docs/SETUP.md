# Setup

The SQE Scrollery website depends on three components to function fully:

1. A local instance on the SQE MariaDB database.
2. A local installation of the perl modules that provide a low level API to that database.
3. A local installation of the Scrollery website maintained in this repository.

## Server Side

**Perquisites**

You will need a woking Docker installation to spin up the SQE database.

### Build Server Side Code

Install the SQE database Docker Image:

```bash
# clone this repository
git clone https://github.com/Scripta-Qumranica-Electronica/Data-files.git

# Cd into the directory
cd Data-files

# Build the image
docker build -t sqe-maria:latest .

# start the container
docker run --name SQE_Database -e MYSQL_ROOT_PASSWORD=none -d -p 3307:3306 sqe-maria:latest

# import the data
docker exec -i SQE_Database /tmp/import-docker.sh
```

Install the SQE API to `/home/perl_libs`:

```bash
git clone https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API /home/perl_libs
``` 

## Client

**Prerequisites:**

* Most recent LTS Node version (currently 8.9.4), which can be downloaded [here](https://nodejs.org/en/download/)
* npm 5+ (bundled with Node)
* Yarn package manager

(Once npm is installed, run `npm install -g yarn` to install Yarn.)

* Recent version of Perl5 (tested working on 5.18.2 and 5.22.1)
* Depending on your system settings for Perl, you may need to run the following commands as sudo.
* You will need the MySQL client and developer libraries in order to compile the Perl database connector DBI::mysql.  The installation procedure varies by operating system.
* You will need the perl package Carton http://search.cpan.org/~miyagawa/Carton-v1.0.28/, installed via:
    * `(sudo) cpan Carton`
    * `(sudo) cpanm Carton`
    * Or in Ubuntu `sudo apt install carton`

### Install Dependencies

From the root of this repository, run the following command to locally install all npm dependencies:

```bash
yarn --pure-lockfile
```

From the `resources/cgi-bin` folder of this repository, run the following command to locally install all perl dependencies:

```bash
(sudo) carton install
```

### Build Client-Side Code

You have a few options, depending on your workflow:

##### `npm run dev`

All files are watched for changes and rebuilt on changes. Open up the application from wherever you configured your server (e.g., `http://localhost`).

##### `npm start`

Utilizes `webpack-dev-server` to achieve hot module reloading. All files are watched and code rebuilt on changes; the changes will show up immediately without needing to refresh the browser.

Open up `http://localhost:9090` after running the command. This will run all requests to the Perl CGI scripts, bypassing your localhost.

### `npm run prod`

For production builds—which minify the assets, remove source maps, etc.—run ```npm run prod```. This is not suitable for development purposes.



