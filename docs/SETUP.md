# Setup

## Server Side

**Prequisites**

Most development on this repository will require a local LAMP/MAMP/WAMP setup.  The SQE website is currently hosted on an Apache server and makese heavy use of Perl CGI scripts to transport data to and from our MariaDB database. I assume that those who will want to assist in development already have or know how to set up the relevant Apache + Perl CGI server and a MariaDB server on their local host.

Developers must configure their Apache server settings to enable the running of perl CGI scripts in the resources/cgi-bin of their local instance of this repository. Access to the SQE database should be accomplished through the API hosted at https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API. The files from the project should be placed in /home/perl_libs.  Make sure to add a SQE_RESTRICTED.pm file there as well in accordance with the documentation in the project's README.md. All Perl CGI files that access the database should acquire their DBH via the method get_dbh in that API.

The latest database dump from our SQE database is hosted in the GitHub repository https://github.com/Scripta-Qumranica-Electronica/Data-files with the name SQE_A.sql. This file must be imported into the local MariaDB instance.

## Client

**Prerequisites:**

* Most recent LTS Node version (currently 8.9.4), which can be downloaded [here](https://nodejs.org/en/download/)
* npm 5+ (bundled with Node)
* Yarn package manager

(Once npm is installed, run `npm install -g yarn` to install Yarn.)

### Install Dependencies

From the root of this repository, run the following command to install all dependencies:

```bash
yarn --pure-lockfile
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



