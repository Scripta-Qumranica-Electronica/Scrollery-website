#!/usr/bin/perl

# TODO: check that the properly versioned SQE_DB_API
# folder exists.  Update lines 51 and 52 to point to
# that folder.

use strict;
use warnings;
use File::chdir;

# Gather information about the tag.
# Format the appropriate paths and variables.
my $tag = $ARGV[0];
my $urlTag = $tag;
$urlTag =~ s/\./_/g;
my $modTag = $tag;
$modTag =~ s/\W/_/g;
$modTag = "SQE_$modTag";
my $epoch = time();

# Setup the logfiles.
my $logFile = '/var/www/html/stable/webhook/log-output.txt';
open(my $log, '>', $logFile) or die "Could not open file '$logFile' $!";

# Start install process.
print $log "Starting install.\n";
print $log "Installing $tag with new package $modTag \n";

# Clone the Scrollery-website.
print $log `git clone https://github.com/Scripta-Qumranica-Electronica/Scrollery-website.git /tmp/Scrollery-builds/$epoch`;

# Build the dependencies
local $CWD = "/tmp/Scrollery-builds/$epoch";
print $log `git checkout tags/$tag`;
print $log `yarn --pure-lockfile`;
print $log `npm run prod`;

# Copy the compiled website to the
# appropriate folder on our webserver.
print $log `if [ -d "/var/www/html/Scrollery/$urlTag" ]; then /bin/rm -Rf /var/www/html/development/Scrollery/$urlTag; fi`;
print $log `/bin/mkdir /var/www/html/development/Scrollery/$urlTag`;
print $log `/bin/cp -f /tmp/Scrollery-builds/$epoch/index.html /var/www/html/development/Scrollery/$urlTag`;
print $log `/bin/cp -rf /tmp/Scrollery-builds/$epoch/dist /var/www/html/development/Scrollery/$urlTag`;
print $log `/bin/cp -rf /tmp/Scrollery-builds/$epoch/resources /var/www/html/development/Scrollery/$urlTag`;

# Cleanup temporary build files.
print $log `/bin/rm -rf /tmp/Scrollery-builds/$epoch`;

# Patch the Perl cgi scripts to use the proper paths.
local $CWD = "/var/www/html/development/Scrollery/$urlTag/resources/cgi-bin";
print $log `perl -i -p -e 's!\.\./perl-libs!/var/www/html/development!g;' *.pl`;
print $log `perl -i -p -e 's/use SQE_/use SQE_API\:\:SQE_/g;' *.pl`;

# Close the log file and end.
print $log "\n";
close $log;