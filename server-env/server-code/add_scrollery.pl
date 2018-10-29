#!/usr/bin/perl

# TODO: check that the properly versioned SQE_DB_API
# folder exists.  Update lines 61 and 62 to point to
# that folder.

use strict;
use warnings;
use File::chdir;
use File::Slurp qw(edit_file);

# Gather information about the tag.
# Format the appropriate paths and variables.
my ($id, $type) =  @ARGV;
my $urlID = $id;
$urlID =~ s/\./_/g;
my $modID = $id;
$modID =~ s/\W/_/g;
$modID = "SQE_$modID";
my $tempDir = "/tmp/Scrollery-builds/Scrollery-website";
my $installDir = "/var/www/html/development/Scrollery/$urlID";
my $lockFile = "/var/www/html/stable/webhook/build.lock";
my $epoch = time();

# Setup the logfiles.
my $logFile = "/var/www/html/stable/webhook/$id-$epoch.log";
open(my $log, '>', $logFile) or die "Could not open file '$logFile' $!";

# Now we wait if the install directory is in use.
sleep 1 while -e $lockFile;

# Directory is available for use, let's lock it for ourselves
my $fileHandler;
open($fileHandler, '>', $lockFile) or
        die "Unable to open file $lockFile : $!";
close($fileHandler)
        or die "Couldn't : $lockFile $!";

# Check if install directory exists, create it if absent.
if (-e $tempDir and -d $tempDir) {
	print $log "$tempDir is available for usage\n"; 
} else {
	print $log "Cloning from GitHub\n"; 
	print $log `git clone https://github.com/Scripta-Qumranica-Electronica/Scrollery-website.git $tempDir`;
}

# Start install process.
print $log "Starting install.\n";
print $log "Installing $id with new package $modID \n";

# Build the dependencies
local $CWD = "$tempDir";
if ($type eq 'tag') {
	print $log `git checkout tags/$id`;
} elsif ($type eq 'branch') {
	print $log `git checkout $id`;
}
print $log `git pull`;
print $log `yarn --pure-lockfile --prefer-offline`;
print $log `npm run prod`;
local $CWD = "$tempDir/resources/cgi-bin";
print $log `carton install`;
local $CWD = "$tempDir";

# Copy the compiled website to the
# appropriate folder on our webserver.
print $log `if [ -d "$installDir" ]; then /bin/rm -Rf $installDir; fi`;
print $log `/bin/mkdir $installDir`;
print $log `/bin/cp -f $tempDir/index.html $installDir`;
print $log `/bin/cp -rf $tempDir/dist $installDir`;
print $log `/bin/cp -rf $tempDir/resources $installDir`;

# Patch the Perl cgi scripts to use the proper paths.
#local $CWD = "$installDir/resources/cgi-bin";
edit_file { s@use lib qw\(\.\./perl-libs\);@use lib qw\($installDir/resources/cgi-bin/local/lib/perl5\);\nuse lib qw\(/var/www/html/development\);\nuse lib qw\(/var/www/html/development/SQE_API\);@g } $installDir . '/resources/cgi-bin/scrollery-cgi.pl';
edit_file { s@use SQE_@use SQE_API\:\:SQE_@g } $installDir . '/resources/cgi-bin/scrollery-cgi.pl';
edit_file { s!Encode\:\:decode\('utf8', encode_json\(\\\@fetchedResults\)\)!encode_json\(\\\@fetchedResults\)!g } $installDir . '/resources/cgi-bin/scrollery-cgi.pl';

#print $log `sed -i'' 's!use lib qw\(\.\./perl-libs\);!use lib qw\($installDir/resources/cgi-bin/local/lib/perl5\);\nuse lib qw\(/var/www/html/development\);!g' *.pl`;
#print $log `perl -i -p -e 's/use SQE_/use SQE_API\:\:SQE_/g;' *.pl`;

# We're finished, let's unlock the install folder
unlink $lockFile;
if(-e $lockFile)
{
	print $log "Failed to delete lockfile.\n";
}
else
{
	print $log "Lockfile removed.\n";
}

# Close the log file and end.
print $log "\n";
close $log;