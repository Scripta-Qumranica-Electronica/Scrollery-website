#!/usr/bin/perl

# TODO: check that the properly versioned SQE_DB_API
# folder exists.  Update lines 61 and 62 to point to
# that folder.

use strict;
use warnings;
use File::chdir;

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
my $lockFile = "/tmp/Scrollery-builds/build.lock";
my $epoch = time();

# Now we wait if the install directory is in use.
sleep 1 while -e $lockFile;

# Directory is available for use, let's lock it for ourselves
my $fileHandler;
open($fileHandler, '>', $lockFile) or
	die "Unable to open file $lockFile : $!";
close($fileHandler)
	or die "Couldn't : $lockFile $!";

# Setup the logfiles.
my $logFile = "/var/www/html/stable/webhook/$id-$epoch.txt";
open(my $log, '>', $logFile) or die "Could not open file '$logFile' $!";

# Start install process.
print $log "Starting install.\n";
print $log "Installing $id with new package $modID \n";

# Build the dependencies
local $CWD = "$tempDir";
print $log `git pull`;
if ($type eq 'tag') {
	print $log `git checkout tags/$id`;
} elsif ($type eq 'branch') {
	print $log `git checkout $id`;
}
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
local $CWD = "$installDir/resources/cgi-bin";
print $log `perl -i -p -e 's!\.\./perl-libs!/var/www/html/development!g;' *.pl`;
print $log `perl -i -p -e 's/use SQE_/use SQE_API\:\:SQE_/g;' *.pl`;

# We're finished, let's unlock the install folder
unlink $lockFile;
if(-e $lockFile)
{
	print "Failed to delete lockfile.";
}
else
{
	print "Lockfile removed";
}

# Close the log file and end.
print $log "\n";
close $log;