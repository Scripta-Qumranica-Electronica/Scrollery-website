# SQE_DB_API

A set of libraries to access and modify data in the 
SQE database.

## Accessing the database

**SQE_DBI.pm** defines children of Perls DBI, 
DBI::db and DBH::st which allow an easy access 
to the SQE database and provide several functions
to read and change the data taling in advance the
scroll version(s) used by the client.

To access the database instance, you need to add 
**SQE_RESTRICTED.pm** which contains the credentials
for the database. Use the following template:
```perl
package SQE_Restricted;
use strict;
use warnings FATAL => 'all';

use constant {
    DSN_SQE =>   "dbi:mysql:SQE:localhost:3306",  #Change this to the connection details of your local MariaDB server
    DB_USERNAME => Iuser', #Change this to your local MariaDB username for SQE
    DB_PASSWORD => 'password', #Change this to your local MariaDB password
};

1;
```
